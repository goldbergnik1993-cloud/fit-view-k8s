import asyncio
from datetime import datetime, timezone, timedelta

from sqlalchemy import delete, update

from core.celery_app import celery_app
from database.models import RefreshTokenModel, CartModel
from database.models.cart import CartStatusEnum
from database.session_postgresql import SessionLocal


async def _cleanup_logic():
    async with SessionLocal() as db:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.execute(
            delete(RefreshTokenModel).where(RefreshTokenModel.expires_at < now)
        )
        await db.commit()


async def _change_cart_status_logic():
    async with SessionLocal() as db:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        update_stmt = (
            update(CartModel)
            .where(
                CartModel.created_at < now - timedelta(hours=24),
                CartModel.status == CartStatusEnum.ACTIVE,
            )
            .values(status=CartStatusEnum.ABANDONED)
        )
        await db.execute(update_stmt)
        await db.commit()


@celery_app.task(name="tasks.cleanup_tasks.cleanup_expired_tokens")
def cleanup_expired_tokens():
    asyncio.run(_cleanup_logic())


@celery_app.task(name="tasks.cleanup_tasks.mark_carts_abandoned")
def mark_carts_abandoned():
    asyncio.run(_change_cart_status_logic())

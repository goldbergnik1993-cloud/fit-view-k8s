import asyncio
from datetime import datetime, timezone, timedelta

from sqlalchemy import delete, update

from core.celery_app import celery_app
from core.logging_config import logger
from database.models import RefreshTokenModel, CartModel
from database.models.cart import CartStatusEnum
from database.session_postgresql import SessionLocal


async def _cleanup_logic():
    async with SessionLocal() as db:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        result = await db.execute(
            delete(RefreshTokenModel).where(RefreshTokenModel.expires_at < now)
        )
        await db.commit()
        logger.info(
            "cleanup_expired_tokens_completed",
            deleted_count=result.rowcount
        )


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
        result = await db.execute(update_stmt)
        await db.commit()
        logger.info(
            "change_cart_status_completed",
            switched_count=result.rowcount
        )


@celery_app.task(name="tasks.cleanup_tasks.cleanup_expired_tokens")
def cleanup_expired_tokens():
    asyncio.run(_cleanup_logic())


@celery_app.task(name="tasks.cleanup_tasks.mark_carts_abandoned")
def mark_carts_abandoned():
    asyncio.run(_change_cart_status_logic())

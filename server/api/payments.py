import stripe
from fastapi import APIRouter, Request, Depends, HTTPException, status, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.settings import settings
from database.session_postgresql import get_db
from database.models.payments import PaymentsModel, PaymentStatusEnum
from database.models.orders import OrderModel, OrderStatusEnum

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = session.id

        stmt = select(PaymentsModel).where(
            PaymentsModel.external_payment_id == session_id
        )
        payment_db = await db.scalar(stmt)

        if payment_db:
            payment_db.status = PaymentStatusEnum.SUCCESSFUL
            order_stmt = select(OrderModel).where(OrderModel.id == payment_db.order_id)
            order_db = await db.scalar(order_stmt)
            if order_db:
                order_db.status = (
                    OrderStatusEnum.PAID
                )

            await db.commit()

    return {"status": "success"}

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from core.settings import settings
from database.models.orders import OrderModel, OrderStatusEnum
from database.models.payments import PaymentsModel, PaymentStatusEnum
from schemas.payments import CheckoutSessionResponseSchema

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_checkout_session(
    order: OrderModel, db: AsyncSession
) -> CheckoutSessionResponseSchema:
    amount_in_cents = int(order.total_amount * 100)
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": amount_in_cents,
                        "product_data": {
                            "name": f"FitView Order #{order.id}",
                        },
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payment-canceled",
            metadata={"order_id": str(order.id), "user_id": str(order.user_id)},
        )

        new_payment = PaymentsModel(
            user_id=order.user_id,
            order_id=order.id,
            amount=order.total_amount,
            currency="usd",
            status=PaymentStatusEnum.PENDING,
            external_payment_id=checkout_session.id,
        )
        db.add(new_payment)
        await db.commit()

        if not checkout_session.url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe did not return a checkout URL.",
            )

        return CheckoutSessionResponseSchema(
            checkout_url=checkout_session.url,  # type: ignore[arg-type]
            payment_intent_id=checkout_session.id,
        )

    except Exception as e:
        await db.rollback()
        print(f"Stripe Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize payment session.",
        )


async def process_stripe_webhook(
        payload: bytes, stripe_signature: str, db: AsyncSession
) -> dict:
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature"
        )

    handled_events = ["checkout.session.completed", "checkout.session.expired"]
    if event["type"] not in handled_events:
        return {"status": "ignored", "reason": "Event type not handled"}

    session = event["data"]["object"]
    session_id = session.id

    stmt = select(PaymentsModel).where(
        PaymentsModel.external_payment_id == session_id
    )
    payment_db = await db.scalar(stmt)

    if not payment_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found"
        )

    order_stmt = select(OrderModel).where(OrderModel.id == payment_db.order_id)
    order_db = await db.scalar(order_stmt)

    if not order_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    if event["type"] == "checkout.session.completed":
        payment_db.status = PaymentStatusEnum.SUCCESSFUL
        order_db.status = OrderStatusEnum.PAID
    elif event["type"] == "checkout.session.expired":
        payment_db.status = PaymentStatusEnum.CANCELED
        order_db.status = OrderStatusEnum.CANCELED

    await db.commit()

    return {"status": "success"}

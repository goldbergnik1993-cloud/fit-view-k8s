import stripe
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from core.settings import settings
from database.models.orders import OrderModel
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

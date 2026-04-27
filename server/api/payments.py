from fastapi import APIRouter, Request, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from database.session_postgresql import get_db
from services.payments import process_stripe_webhook

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/webhook", summary="Stripe Webhook")
async def stripe_webhook(
        request: Request,
        stripe_signature: str = Header(None),
        db: AsyncSession = Depends(get_db),
):
    """
    Secure, server-to-server webhook endpoint for processing asynchronous
    Stripe events.

    This endpoint intercepts `checkout.session.completed` events,
    cryptographically verifies the `Stripe-Signature` header to prevent
    spoofing, and automatically updates the associated database Order and
    Payment statuses to 'Successful'.
    """
    payload = await request.body()

    return await process_stripe_webhook(
        payload=payload,
        stripe_signature=stripe_signature,
        db=db
    )

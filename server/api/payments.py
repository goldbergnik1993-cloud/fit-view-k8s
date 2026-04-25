from fastapi import APIRouter, Request, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from database.session_postgresql import get_db
from services.payments import process_stripe_webhook

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/webhook")
async def stripe_webhook(
        request: Request,
        stripe_signature: str = Header(None),
        db: AsyncSession = Depends(get_db),
):
    payload = await request.body()

    return await process_stripe_webhook(
        payload=payload,
        stripe_signature=stripe_signature,
        db=db
    )

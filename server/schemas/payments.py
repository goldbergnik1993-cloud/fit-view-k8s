from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, HttpUrl

from database.models.payments import PaymentStatusEnum


class PaymentBaseSchema(BaseModel):
    amount: Decimal = Field(..., max_digits=10, decimal_places=2)
    currency: str = Field(default="usd", min_length=3, max_length=3)
    status: PaymentStatusEnum


class PaymentRetrieveSchema(PaymentBaseSchema):
    id: int
    user_id: Optional[int]
    order_id: Optional[int]
    external_payment_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CheckoutSessionResponseSchema(BaseModel):
    checkout_url: HttpUrl
    payment_intent_id: str

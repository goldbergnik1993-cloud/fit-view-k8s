import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from database.models.orders import OrderStatusEnum
from schemas.cart import ItemInCartSchema


class DeliveryMethodEnum(str, enum.Enum):
    COURIER = "COURIER"
    POST_OFFICE = "POST_OFFICE"
    PARCEL_LOCKER = "PARCEL_LOCKER"


class DeliveryInfoSchema(BaseModel):
    first_name: str = Field(
        ...,
        min_length=3,
        max_length=20,
        description="First name",
        example="John"
    )
    last_name: str = Field(
        ...,
        min_length=3,
        max_length=20,
        description="Last name",
        example="Smith"
    )
    country: str = Field(
        ..., description="Two-letter country code", example="US"
    )
    city: str = Field(..., example="New York")
    phone_number: str = Field(..., example="+12345678901")
    delivery_method: DeliveryMethodEnum
    zip_code: Optional[str] = Field(None, example="NY 10011")
    address_line: Optional[str] = Field(None, example="123 Main St, Apt 4B")
    delivery_point_id: Optional[str] = Field(
        None,
        description="ID of the delivery service office or post machine",
        example="NP-8492"
    )

    @model_validator(mode='after')
    def validate_delivery_requirements(self) -> "DeliveryInfoSchema":
        if self.delivery_method == DeliveryMethodEnum.COURIER:
            if not self.zip_code or not self.address_line:
                raise ValueError(
                    "Courier delivery requires both 'zip_code' and 'address_line'."
                )

        elif self.delivery_method in (
                DeliveryMethodEnum.POST_OFFICE,
                DeliveryMethodEnum.POST_MACHINE):
            if not self.delivery_point_id:
                raise ValueError(
                    f"{self.delivery_method.value} requires a 'delivery_point_id'."
                )

        return self


class OrderItemCreateSchema(BaseModel):
    item_id: int
    size_label: str
    quantity: int = Field(default=1, gt=0)


class OrderCreateSchema(BaseModel):
    delivery_info: DeliveryInfoSchema


class OrderItemRetrieveSchema(BaseModel):
    id: int
    item_id: Optional[int]
    size_label: str
    quantity: int
    price_at_purchase: float

    item: Optional[ItemInCartSchema] = None

    model_config = ConfigDict(from_attributes=True)


class OrderRetrieveSchema(BaseModel):
    id: int
    user_id: Optional[int]
    total_amount: float
    status: OrderStatusEnum
    delivery_info: DeliveryInfoSchema
    created_at: datetime
    updated_at: datetime

    order_items: List[OrderItemRetrieveSchema]

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdateSchema(BaseModel):
    status: OrderStatusEnum

from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field

from database.models.cart import CartStatusEnum, CartItemModel
from schemas.catalog import ItemListItemSchema, ItemBaseSchema


class CartBaseSchema(BaseModel):
    user_id: int


class CartItemCreateSchema(BaseModel):
    item_id: int
    quantity: int = Field(default=1, gt=0)


class ItemInCartSchema(ItemBaseSchema):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CartItemsListSchema(BaseModel):
    id: int
    quantity: int
    item: ItemInCartSchema

    model_config = ConfigDict(from_attributes=True)


class CartRetrieveSchema(CartBaseSchema):
    id: int
    status: CartStatusEnum
    cart_items: List[CartItemsListSchema] = []
    created_at: datetime
    updated_at: datetime

    total_items: int = 0
    total_price: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class CartActionResponseSchema(BaseModel):
    status: str
    message: str
    item_count: int
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict

from database.models.catalog import ItemCategoryEnum
from schemas.base import PaginatedResponse


# ===================== ITEMS-LIST =====================================
class ItemBaseSchema(BaseModel):
    name: str
    brand: str
    category: ItemCategoryEnum
    image_url: str
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class ItemListItemSchema(ItemBaseSchema):
    id: int
    available_sizes: List[str]
    available_measurements: List[str]

    model_config = ConfigDict(from_attributes=True)


class ItemsListSchema(PaginatedResponse, BaseModel):
    items: List[ItemListItemSchema]



class ItemFilterParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

    category: Optional[str] = Field(
        None, description="Search by item's category"
    )
    name: Optional[str] = Field(None, description="Search by item's name")
    brands: Optional[List[int]] = Field(
        None,
        description="Search by item brands' ids (allows multiple choices)"
    )
    size: Optional[int] = Field(None, description="Search by item's size id")
    min_price: Optional[Decimal] = Field(
        None, description="Search by item's min price"
    )
    max_price: Optional[Decimal] = Field(
        None, description="Search by item's max price"
    )
    sort_by: str = Field(
        "price_asc",
        pattern="^(price_asc|price_desc)$",
        description="Options: price_asc (default), price_desc"
    )

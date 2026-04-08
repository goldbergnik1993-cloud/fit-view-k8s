from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator, FileUrl

from database.models.catalog import ItemCategoryEnum
from schemas.base import PaginatedResponse


class BrandViewSchema(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# ===================== ITEMS-LIST =====================================
class ItemBaseSchema(BaseModel):
    name: str
    brand: BrandViewSchema
    category: ItemCategoryEnum
    image_url: str
    price: Decimal
    is_favorite: bool = False

    model_config = ConfigDict(from_attributes=True)


class ItemListItemSchema(ItemBaseSchema):
    id: int
    available_sizes: List[str]
    available_measurements: List[str]

    model_config = ConfigDict(from_attributes=True)


class ItemsListSchema(PaginatedResponse[ItemListItemSchema]):
    pass


class ItemFilterParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

    category: Optional[ItemCategoryEnum] = Field(
        None, description="Search by item's category"
    )
    name: Optional[str] = Field(None, description="Search by item's name")
    size: Optional[str] = Field(None, description="Search by item's size label")
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


# ===================== ITEM-DETAIL =====================================
class SizeMixin:
    id: int
    size_label: str

    model_config = ConfigDict(from_attributes=True)


class SizeChartListSchema(SizeMixin, BaseModel):
    pass


class MeasurementListSchema(SizeMixin, BaseModel):
    pass


class ItemDetailSchema(ItemBaseSchema):
    id: int
    available_sizes: List[SizeChartListSchema] = Field(
        validation_alias="size_charts")
    available_measurements: List[MeasurementListSchema] = Field(
        validation_alias="measurements")

    model_config = ConfigDict(from_attributes=True)


# ============================== FAVORITES ================================
class ToggleFavoriteSchema(BaseModel):
    message: str
    is_favorite: bool


# ============================ FITTING-ROOM ================================
class FittingRoomResultSchema(BaseModel):
    h_end_cm: float
    line_position_pct: float
    result_label: str
    result_text: str

    height_cm: int
    item_name: str
    category: str


# ============================= ITEM-CREATE ================================
class ItemCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    brand: str = Field(..., min_length=1, max_length=50)
    category: ItemCategoryEnum
    image_url: FileUrl


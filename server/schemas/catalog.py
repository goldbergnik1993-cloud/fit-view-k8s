from decimal import Decimal
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, ConfigDict, FileUrl

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
class FittingRoomRequestSchema(BaseModel):
    measurement_id: int
    size_chart_id: int
    height_cm: Optional[int] = Field(None, ge=100, le=250)
    shoulders_length_cm: Optional[int] = Field(None, ge=30, le=60)
    breast_length_cm: Optional[int] = Field(None, ge=60, le=180)
    waist_length_cm: Optional[int] = Field(None, ge=40, le=150)
    hips_length_cm: Optional[int] = Field(None, ge=60, le=180)
    leg_length_cm: Optional[int] = Field(None, ge=50, le=120)


class VisualMarkersSchema(BaseModel):
    h_end_cm: float
    line_position_pct: float
    reference_point: str


class FitAnalysisSchema(BaseModel):
    waist_fit: Literal["tight", "perfect", "loose"] | None
    breast_fit: Literal["tight", "perfect", "loose"] | None
    hips_fit: Literal["tight", "perfect", "loose"] | None
    shoulders_fit: Literal["tight", "perfect", "loose"] | None


class UserBodySchema(BaseModel):
    gender: str
    height_cm: Optional[int]
    leg_length_cm: Optional[int]
    hips_length_cm: Optional[int]
    waist_length_cm: Optional[int]
    breast_length_cm: Optional[int]
    shoulders_length_cm: Optional[int]


class FittingRoomResponseSchema(BaseModel):
    item_id: int
    size_label: str
    visual_markers: VisualMarkersSchema
    fit_analysis: FitAnalysisSchema
    user_body: UserBodySchema

    model_config = ConfigDict(from_attributes=True)


# ============================= ITEM-CREATE ================================
class ItemCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    brand: str = Field(..., min_length=1, max_length=50)
    category: ItemCategoryEnum
    image_url: FileUrl


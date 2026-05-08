from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict

from database.models.catalog import ItemCategoryEnum, ItemRefPointEnum
from database.models.events import FitResultEnum
from database.models.user import GenderEnum
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
    gender: GenderEnum
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

    page: int = Field(1, ge=1, description="Page number")
    per_page: int = Field(
        20,
        ge=1,
        le=100,
        description="Number of items per page. Default is 20, maximum is 100.",
    )

    category: Optional[ItemCategoryEnum] = Field(
        None, description="Search by item's category (e.g. '?category=skirt')"
    )
    name: Optional[str] = Field(
        None, description="Search by item's name (e.g. '?name=floral')"
    )
    size: Optional[str] = Field(
        None, description="Search by item's size label (e.g. '?size=m')"
    )
    gender: Optional[GenderEnum] = Field(
        None, description="Search by item's gender (e.g. '?gender=female')"
    )
    min_price: Optional[Decimal] = Field(
        None, description="Search by item's min price (e.g. '?min_price=20')"
    )
    max_price: Optional[Decimal] = Field(
        None, description="Search by item's max price (e.g. '?max_price=100')"
    )
    sort_by: str = Field(
        "new",
        pattern="^(price_asc|price_desc|new|popular)$",
        description="Options: price_asc, price_desc, new (default), popular",
    )


# ===================== ITEM-DETAIL =====================================
class SizeMixin:
    id: int
    size_label: str

    model_config = ConfigDict(from_attributes=True)


class SizeChartListSchema(SizeMixin, BaseModel):
    pass


class MeasurementListSchema(SizeMixin, BaseModel):
    total_length_cm: float
    inseam_cm: float


class ItemDetailSchema(ItemBaseSchema):
    id: int
    description: Optional[str] = None
    available_sizes: List[SizeChartListSchema] = Field(validation_alias="size_charts")
    available_measurements: List[MeasurementListSchema] = Field(
        validation_alias="measurements"
    )

    mandatory_fields: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# ============================== FAVORITES ================================
class ToggleFavoriteSchema(BaseModel):
    message: str
    is_favorite: bool


# ============================ FITTING-ROOM ================================
class FittingRoomRequestSchema(BaseModel):
    size_label: str = Field(
        ..., min_length=1, max_length=4, description="e.g., 'M', 'L'"
    )
    height_cm: Optional[int] = Field(None, ge=100, le=250)
    shoulders_length_cm: Optional[int] = Field(None, ge=30, le=60)
    breast_length_cm: Optional[int] = Field(None, ge=60, le=180)
    waist_length_cm: Optional[int] = Field(None, ge=40, le=150)
    hips_length_cm: Optional[int] = Field(None, ge=60, le=180)
    leg_length_cm: Optional[int] = Field(None, ge=50, le=120)

    model_config = ConfigDict(from_attributes=True)


class VisualMarkersSchema(BaseModel):
    h_end_cm: float
    line_position_pct: float
    reference_point: ItemRefPointEnum

    model_config = ConfigDict(from_attributes=True)


class FitAnalysisSchema(BaseModel):
    waist_fit: FitResultEnum | None
    breast_fit: FitResultEnum | None
    hips_fit: FitResultEnum | None
    shoulders_fit: FitResultEnum | None

    model_config = ConfigDict(from_attributes=True)


class UserBodySchema(BaseModel):
    gender: str
    height_cm: Optional[int]
    leg_length_cm: Optional[int]
    hips_length_cm: Optional[int]
    waist_length_cm: Optional[int]
    breast_length_cm: Optional[int]
    shoulders_length_cm: Optional[int]

    model_config = ConfigDict(from_attributes=True)


class FittingRoomResponseSchema(BaseModel):
    item_id: int
    size_label: str
    gender: GenderEnum
    visual_markers: VisualMarkersSchema
    fit_analysis: FitAnalysisSchema
    user_body: UserBodySchema
    fitting_image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ============================= ITEM-CREATE ================================
class SizeChartCreateSchema(BaseModel):
    size_label: str = Field(..., min_length=0, max_length=10)
    hips_min_cm: Optional[float] = Field(None, ge=0, le=115)
    hips_max_cm: Optional[float] = Field(None, ge=0, le=123)
    waist_min_cm: Optional[float] = Field(None, ge=0, le=97)
    waist_max_cm: Optional[float] = Field(None, ge=0, le=105)
    breast_min_cm: Optional[float] = Field(None, ge=0, le=113)
    breast_max_cm: Optional[float] = Field(None, ge=0, le=121)
    shoulders_min_cm: Optional[float] = Field(None, ge=0, le=51)
    shoulders_max_cm: Optional[float] = Field(None, ge=0, le=54)

    model_config = ConfigDict(from_attributes=True)


class MeasurementCreateSchema(BaseModel):
    size_label: str = Field(..., min_length=1, max_length=10)
    total_length_cm: float = Field(..., ge=0, le=200)
    inseam_cm: float = Field(..., ge=0, le=120)

    model_config = ConfigDict(from_attributes=True)


class ItemCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    brand: str = Field(..., min_length=1, max_length=50)
    category: ItemCategoryEnum = Field(...)
    gender: GenderEnum = Field(...)
    image_url: str
    fitting_image_url: Optional[str] = Field(None)
    price: Decimal = Field(..., ge=0, max_digits=10, decimal_places=2)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    reference_point: ItemRefPointEnum = Field(...)
    ref_coefficient: float = Field(..., gt=0, lt=1)

    size_charts: List[SizeChartCreateSchema] = Field(default_factory=list)
    measurements: List[MeasurementCreateSchema] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ItemUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[ItemCategoryEnum] = Field(None)
    gender: Optional[GenderEnum] = Field(None)
    image_url: Optional[str] = Field(None)
    fitting_image_url: Optional[str] = Field(None)
    price: Optional[Decimal] = Field(None, ge=0, max_digits=10, decimal_places=2)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    reference_point: Optional[ItemRefPointEnum] = Field(None)
    ref_coefficient: Optional[float] = Field(None, gt=0, lt=1)

    size_charts: Optional[List[SizeChartCreateSchema]] = Field(default_factory=list)
    measurements: Optional[List[MeasurementCreateSchema]] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ItemSuggestionSchema(BaseModel):
    id: int
    name: str
    image_url: str
    price: float

    model_config = ConfigDict(from_attributes=True)

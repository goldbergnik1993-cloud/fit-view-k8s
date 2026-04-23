import re
from datetime import date
from typing import Optional, Annotated

from pydantic import (
    BaseModel,
    EmailStr,
    ConfigDict,
    field_validator,
    Field,
    AfterValidator,
)

from database.models.user import GenderEnum
from schemas.base import PaginatedResponse
from schemas.catalog import ItemListItemSchema


def validate_age_limit(value: Optional[date]) -> Optional[date]:
    if value is None:
        return value

    today = date.today()
    try:
        min_age_date = today.replace(year=today.year - 14)
        max_age_date = today.replace(year=today.year - 100)
    except ValueError:
        min_age_date = today.replace(year=today.year - 14, month=2, day=28)
        max_age_date = today.replace(year=today.year - 100, month=2, day=28)

    if value > min_age_date:
        raise ValueError("User must be at least 14 years old.")
    if value < max_age_date:
        raise ValueError("User cannot be older than 100 years.")

    return value


AgeValidatedDate = Annotated[Optional[date], AfterValidator(validate_age_limit)]


class PasswordMixin:
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        return v


class UserBaseSchema(BaseModel):
    email: EmailStr


class LoginSchema(UserBaseSchema):
    password: str


class PasswordResetCompleteSchema(PasswordMixin, BaseModel):
    token: str


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserCreateSchema(PasswordMixin, UserBaseSchema):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    phone_number: str = Field(..., min_length=5, max_length=50)
    birth_date: AgeValidatedDate = Field(None)


class UserRetrieveSchema(UserBaseSchema):
    id: int
    role: str
    ab_group: str

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateSchema(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone_number: Optional[str] = Field(None, min_length=5, max_length=50)
    birth_date: AgeValidatedDate = Field(None)
    email: Optional[EmailStr] = Field(None)
    password: Optional[str] = Field(None, min_length=8, max_length=100)

    height_cm: Optional[int] = Field(None, ge=100, le=250)
    gender: Optional[GenderEnum] = Field(None)
    shoulders_length_cm: Optional[int] = Field(None, ge=30, le=60)
    breast_length_cm: Optional[int] = Field(None, ge=60, le=180)
    waist_length_cm: Optional[int] = Field(None, ge=40, le=150)
    hips_length_cm: Optional[int] = Field(None, ge=60, le=180)
    leg_length_cm: Optional[int] = Field(None, ge=50, le=120)

    @field_validator("password")
    @classmethod
    def optional_password_complexity(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.search(r"\d", v) or not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain a number and uppercase letter.")
        return v


class ProfileViewSchema(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    birth_date: Optional[date]
    height_cm: Optional[int]
    gender: Optional[GenderEnum]
    shoulders_length_cm: Optional[int]
    breast_length_cm: Optional[int]
    waist_length_cm: Optional[int]
    hips_length_cm: Optional[int]
    leg_length_cm: Optional[int]

    model_config = ConfigDict(from_attributes=True)


class FavoritesListSchema(PaginatedResponse[ItemListItemSchema]):
    pass


class MessageSchema(BaseModel):
    message: str


class EmailVerificationSchema(BaseModel):
    email: str
    code: str

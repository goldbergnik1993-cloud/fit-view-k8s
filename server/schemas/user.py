import re
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, Field

from database.models.user import GenderEnum
from schemas.base import PaginatedResponse
from schemas.catalog import ItemListItemSchema


class UserBaseSchema(BaseModel):
    email: EmailStr


class PasswordMixin:
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[A-Z]", v):
            raise ValueError(
                "Password must contain at least one uppercase letter.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError(
                "Password must contain at least one special character.")
        return v


class UserCreateSchema(PasswordMixin, UserBaseSchema):
    pass


class UserRetrieveSchema(UserBaseSchema):
    id: int
    role: str
    ab_group: str

    model_config = ConfigDict(from_attributes=True)


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


class ProfileBaseSchema(BaseModel):
    height_cm: int = Field(..., ge=100, le=250)
    gender: Optional[GenderEnum] = Field("female")
    shoulders_length_cm: int = Field(..., ge=30, le=60)
    breast_length_cm: int = Field(..., ge=60, le=180)
    waist_length_cm: int = Field(..., ge=40, le=150)
    hips_length_cm: int = Field(..., ge=60, le=180)
    leg_length_cm: int = Field(..., ge=50, le=120)


class ProfileViewSchema(ProfileBaseSchema):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class FavoritesListSchema(PaginatedResponse[ItemListItemSchema]):
    pass


class ProfileUpdateSchema(BaseModel):
    height_cm: Optional[int] = Field(None, ge=100, le=250)
    gender: Optional[GenderEnum] = Field(None)
    shoulders_length_cm: Optional[int] = Field(None, ge=30, le=60)
    breast_length_cm: Optional[int] = Field(None, ge=60, le=180)
    waist_length_cm: Optional[int] = Field(None, ge=40, le=150)
    hips_length_cm: Optional[int] = Field(None, ge=60, le=180)
    leg_length_cm: Optional[int] = Field(None, ge=50, le=120)


class MessageSchema(BaseModel):
    message: str

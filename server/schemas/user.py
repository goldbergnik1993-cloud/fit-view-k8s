import re

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, Field


class UserBaseSchema(BaseModel):
    email: EmailStr


class UserCreateSchema(UserBaseSchema):
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


class UserRetrieveSchema(UserBaseSchema):
    id: int
    role: str

    model_config = ConfigDict(from_attributes=True)


class LoginSchema(UserBaseSchema):
    password: str


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


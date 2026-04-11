from pydantic import BaseModel, Field, ConfigDict, EmailStr

from database.models.user import UserRoleEnum


class ChangeUserRoleSchema(BaseModel):
    user_email: EmailStr
    user_role: UserRoleEnum = Field(...)

    model_config = ConfigDict(from_attributes=True)

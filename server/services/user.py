from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.user import (
    UserModel,
    UserProfileModel,
)
from schemas.user import (
    ProfileUpdateSchema,
    ProfileViewSchema,
)
from utils.tokens import hash_password


async def get_user_profile(
        db: AsyncSession, user: UserModel
) -> ProfileViewSchema:
    profile_stmt = select(UserProfileModel).where(
        UserProfileModel.user_id == user.id)
    profile = await db.scalar(profile_stmt)
    profile.email = user.email

    return ProfileViewSchema.model_validate(profile)


async def profile_update(
        payload: ProfileUpdateSchema,
        user: UserModel,
        db: AsyncSession
) -> ProfileViewSchema:
    profile_stmt = select(UserProfileModel).where(
        UserProfileModel.user_id == user.id)
    profile_db = await db.scalar(profile_stmt)

    update_data = payload.model_dump(exclude_unset=True)
    new_email = None
    if update_data.get("email"):
        new_email = update_data.pop("email")
        user.email = new_email
        await db.flush()
    if update_data.get("password"):
        new_password = update_data.pop("password")
        user.hashed_password = hash_password(password=new_password)
        await db.flush()

    for field, value in update_data.items():
        setattr(profile_db, field, value)

    try:
        await db.commit()
        await db.refresh(profile_db)
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while saving your profile. Try again later.",
        )

    profile_db.email = new_email if new_email else user.email

    return ProfileViewSchema.model_validate(profile_db)

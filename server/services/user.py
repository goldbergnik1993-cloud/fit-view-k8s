import secrets
from datetime import datetime, UTC, timedelta
from random import choice

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.settings import settings
from database.models.user import (
    UserModel,
    UserRoleEnum,
    RefreshTokenModel,
    UserProfileModel
)
from schemas.user import (
    UserCreateSchema,
    UserRetrieveSchema,
    LoginSchema,
    RefreshTokenRequest,
    ProfileBaseSchema
)
from utils.tokens import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)


async def user_create(
        user: UserCreateSchema, db: AsyncSession
) -> UserRetrieveSchema:
    existing_user_stmt = select(UserModel).where(
        UserModel.email == user.email)
    existing_user = await db.scalar(existing_user_stmt)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    new_user = UserModel(
        email=user.email,
        hashed_password=hash_password(user.password),
        role=UserRoleEnum.BUYER,
        ab_group=choice(("A", "B"))
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserRetrieveSchema.model_validate(new_user)


async def user_login(payload: LoginSchema, db: AsyncSession):
    result = await db.execute(
        select(UserModel).where(UserModel.email == payload.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(
            payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    refresh_token = await create_refresh_token(db, user.id)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


async def refresh_token_pair(
        payload: RefreshTokenRequest,
        db: AsyncSession
):
    stmt = select(RefreshTokenModel).where(
        RefreshTokenModel.token == payload.refresh_token)
    result = await db.execute(stmt)
    db_token = result.scalar_one_or_none()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    if db_token.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        await db.delete(db_token)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please login again."
        )

    user_stmt = select(UserModel).where(UserModel.id == db_token.user_id)
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()

    new_access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email})

    new_refresh_token_str = secrets.token_urlsafe(64)
    db_token.token = new_refresh_token_str
    exp_date = datetime.now(UTC) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    db_token.expires_at = exp_date.replace(tzinfo=None)

    await db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token_str,
        "token_type": "bearer"
    }


async def profile_create(
        payload: ProfileBaseSchema,
        user: UserModel,
        db: AsyncSession
) -> UserProfileModel:
    existing_profile = await db.scalar(
        select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a profile."
        )

    data = payload.model_dump(exclude={"user_id"})
    new_profile = UserProfileModel(
        user_id=user.id,
        **data
    )

    db.add(new_profile)
    await db.commit()
    await db.refresh(new_profile)
    return new_profile


async def get_user_profile(db: AsyncSession, user: UserModel):
    profile_stmt = select(UserProfileModel).where(
        UserProfileModel.user_id == user.id
    )
    profile = await db.scalar(profile_stmt)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't have a profile."
        )
    return profile

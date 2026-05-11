import json
from fastapi import HTTPException, status
from random import randint
from redis import Redis
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_user_by_email
from core.settings import settings
from database.models.user import (
    UserModel,
    UserProfileModel,
)
from schemas.user import (
    ProfileUpdateSchema,
    ProfileViewSchema,
    EmailChangeVerificationSchema,
    MessageSchema,
)
from services.auth import env
from tasks.email_tasks import send_email
from utils.tokens import hash_password


async def get_user_profile(db: AsyncSession, user: UserModel) -> ProfileViewSchema:
    profile_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    profile = await db.scalar(profile_stmt)
    profile.email = user.email  # type: ignore

    return ProfileViewSchema.model_validate(profile)


async def profile_update(
    payload: ProfileUpdateSchema, user: UserModel, db: AsyncSession, redis_client: Redis
) -> ProfileViewSchema:
    profile_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    profile_db = await db.scalar(profile_stmt)

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("email") or update_data.get("password"):
        user_stmt = select(UserModel).where(UserModel.id == user.id)
        user = await db.scalar(user_stmt)  # type: ignore
        assert user is not None, "User not found in the database."

    new_email = None
    if update_data.get("email"):
        new_email = update_data.pop("email")
        existing_user = await get_user_by_email(email=new_email, db=db)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use.",
            )
        activation_code = f"{randint(0, 9999):04d}"
        redis_payload = json.dumps({"new_email": new_email, "code": activation_code})

        await redis_client.setex(
            name=f"pending_email:{user.id}",
            time=settings.ACTIVATION_CODE_EXPIRE_MINUTES * 60,
            value=redis_payload,
        )

        template = env.get_template("change_email.html")
        html_content = template.render(
            verification_code=str(activation_code),
            expires_in=settings.ACTIVATION_CODE_EXPIRE_MINUTES,
        )
        send_email.delay(
            email=new_email,
            body_data={"html": html_content},
            msg_type="changing_email",
        )
        profile_db.email = user.email  # type: ignore
        await db.flush()

    if update_data.get("password"):
        new_password = update_data.pop("password")
        user.hashed_password = hash_password(password=new_password)
        await db.flush()

        template = env.get_template("reset_password_success.html")
        html_content = template.render(
            reset_url=f"{settings.FRONTEND_URL}/auth/reset-password"
        )
        send_email.delay(
            email=user.email,
            body_data={"html": html_content},
            msg_type="reset_pass_success",
        )

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

    profile_db.email = new_email if new_email else user.email  # type: ignore
    await redis_client.delete(f"fit:profile:{user.id}")

    return ProfileViewSchema.model_validate(profile_db)


async def verify_email_change(
    payload: EmailChangeVerificationSchema,
    user: UserModel,
    db: AsyncSession,
    redis_client: Redis,
):
    redis_key = f"pending_email:{user.id}"
    stored_data_str = await redis_client.get(redis_key)

    if not stored_data_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is invalid or has expired. Please request a new one.",
        )

    stored_data = json.loads(stored_data_str)

    if stored_data.get("code") != payload.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect verification code.",
        )

    new_email = stored_data.get("new_email")

    existing_user_stmt = select(UserModel).where(UserModel.email == new_email)
    if await db.scalar(existing_user_stmt):
        await redis_client.delete(redis_key)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is no longer available.",
        )

    user_stmt = select(UserModel).where(UserModel.id == user.id)
    user = await db.scalar(user_stmt)  # type: ignore
    assert user is not None, "User not found in the database."

    user.email = new_email

    try:
        await db.commit()
        await db.refresh(user)

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Something went wrong while updating your email. Try again later. Error: {str(e)}",
        )

    await redis_client.delete(redis_key)

    return MessageSchema(message="Your email address has been successfully updated!")

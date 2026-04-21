import secrets
from datetime import datetime, UTC, timedelta
from random import choice

from fastapi import HTTPException, status, Request
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_user_by_email
from core.settings import settings
from database.models.user import (
    UserModel,
    UserRoleEnum,
    RefreshTokenModel,
    UserProfileModel,
)
from schemas.user import (
    UserCreateSchema,
    UserRetrieveSchema,
    LoginSchema,
    RefreshTokenRequest,
    ProfileBaseSchema,
    ProfileUpdateSchema,
    ProfileViewSchema,
    PasswordResetCompleteSchema,
    MessageSchema,
)
from tasks.email_tasks import send_email
from utils.tokens import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_token,
)

env = Environment(loader=FileSystemLoader("templates"))


async def user_create(user: UserCreateSchema, db: AsyncSession) -> UserRetrieveSchema:
    existing_user_stmt = select(UserModel).where(UserModel.email == user.email)
    existing_user = await db.scalar(existing_user_stmt)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    new_user = UserModel(
        email=user.email,
        hashed_password=hash_password(user.password),
        role=UserRoleEnum.BUYER,
        ab_group=choice(("A", "B")),
        is_active=False,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_token(email=new_user.email, purpose="email_verification")
    template = env.get_template("activation_email.html")
    html_content = template.render(
        activation_url=f"{settings.FRONTEND_URL}/user/confirm-email?token={token}",
        expires_in=settings.ACTIVATION_TOKEN_EXPIRE_HOURS,
    )
    send_email.delay(
        email=user.email,
        body_data={"html": html_content},
        msg_type="activation",
    )

    return UserRetrieveSchema.model_validate(new_user)


async def user_login(payload: LoginSchema, db: AsyncSession):
    result = await db.execute(select(UserModel).where(UserModel.email == payload.email))
    user = result.scalar_one_or_none()

    if (
        not user
        or not user.is_active
        or not verify_password(payload.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    refresh_token = await create_refresh_token(db, user.id)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


async def refresh_token_pair(payload: RefreshTokenRequest, db: AsyncSession):
    stmt = select(RefreshTokenModel).where(
        RefreshTokenModel.token == payload.refresh_token
    )
    result = await db.execute(stmt)
    db_token = result.scalar_one_or_none()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    if db_token.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        await db.delete(db_token)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please login again.",
        )

    user_stmt = select(UserModel).where(UserModel.id == db_token.user_id)
    user_result = await db.execute(user_stmt)
    user = user_result.scalar_one_or_none()

    new_access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    new_refresh_token_str = secrets.token_urlsafe(64)
    db_token.token = new_refresh_token_str
    exp_date = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_token.expires_at = exp_date.replace(tzinfo=None)

    await db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token_str,
        "token_type": "bearer",
    }


async def profile_create(
    payload: ProfileBaseSchema, user: UserModel, db: AsyncSession
) -> UserProfileModel:
    existing_profile = await db.scalar(
        select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a profile.",
        )

    data = payload.model_dump(exclude={"user_id"})
    new_profile = UserProfileModel(user_id=user.id, **data)

    db.add(new_profile)
    await db.commit()
    await db.refresh(new_profile)
    return new_profile


async def get_user_profile(db: AsyncSession, user: UserModel):
    profile_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    profile = await db.scalar(profile_stmt)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You don't have a profile."
        )
    return profile


async def profile_update(
    payload: ProfileUpdateSchema, user: UserModel, db: AsyncSession
) -> ProfileViewSchema:
    profile_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    profile_db = await db.scalar(profile_stmt)
    if not profile_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="You don't have a profile."
        )
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile_db, field, value)

    try:
        await db.commit()
        await db.refresh(profile_db)

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong. Try again later.",
        )
    return ProfileViewSchema.model_validate(profile_db)


async def profile_delete(user: UserModel, db: AsyncSession) -> dict:
    profile_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    profile_db = await db.scalar(profile_stmt)
    if not profile_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="You don't have a profile."
        )
    await db.delete(profile_db)
    await db.commit()
    return {"message": "Your profile has been deleted."}


async def verify_email(request: Request, token: str, db: AsyncSession) -> str:
    payload = decode_token(token=token, purpose="email_verification")
    user = await get_user_by_email(email=payload.get("sub"), db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid token."
        )
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You are already active."
        )
    user.is_active = True
    await db.commit()
    await db.refresh(user)
    return user.email


async def reset_password(email: str, db: AsyncSession) -> MessageSchema:
    user = await get_user_by_email(email=email, db=db)
    if user:
        reset_token = create_token(email=email, purpose="password_reset")
        template = env.get_template("reset_password.html")
        body_data = {
            "html": template.render(
                reset_url=f"{settings.FRONTEND_URL}/password-reset-confirm?token={reset_token}",
                expires_in=settings.RESET_TOKEN_EXPIRE_MINUTES,
            )
        }
        send_email.delay(
            email=user.email,
            body_data=body_data,
            msg_type="reset_pass",
        )
    return MessageSchema(message="If the account exists, a reset email has been sent.")


async def reset_password_confirm(
    data: PasswordResetCompleteSchema, db: AsyncSession
) -> MessageSchema:
    payload = decode_token(token=data.token, purpose="password_reset")
    user_email = payload.get("sub")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token."
        )

    user = await get_user_by_email(email=user_email, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    user.hashed_password = hash_password(data.password)
    await db.commit()

    template = env.get_template("reset_password_success.html")
    body_data = {
        "html": template.render(
            login_url=f"{settings.FRONTEND_URL}/login",
        )
    }
    send_email.delay(
        email=user.email,
        body_data=body_data,
        msg_type="reset_pass_success",
    )

    return MessageSchema(message="Your password has been changed successfully.")

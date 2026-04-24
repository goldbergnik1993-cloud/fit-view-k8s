import secrets
from datetime import datetime, UTC, timedelta
from random import randint, choice

from fastapi import HTTPException, status
from jinja2 import Environment, FileSystemLoader
from redis import Redis
from sqlalchemy import select
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
    PasswordResetCompleteSchema,
    MessageSchema,
    EmailVerificationSchema,
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


async def user_create(
    user: UserCreateSchema, db: AsyncSession, redis_client: Redis
) -> UserRetrieveSchema:
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

    await db.flush()

    new_profile = UserProfileModel(
        user_id=new_user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        birth_date=user.birth_date,
    )
    db.add(new_profile)

    await db.commit()
    await db.refresh(new_user)

    activation_code = f"{randint(0, 9999):04d}"
    await redis_client.setex(
        name=f"otp:{new_user.email}",
        time=settings.ACTIVATION_CODE_EXPIRE_MINUTES * 60,
        value=activation_code,
    )

    template = env.get_template("activation_email.html")
    html_content = template.render(
        verification_code=str(activation_code),
        expires_in=settings.ACTIVATION_CODE_EXPIRE_MINUTES,
    )
    send_email.delay(
        email=user.email,
        body_data={"html": html_content},
        msg_type="activation",
    )

    return UserRetrieveSchema.model_validate(new_user)


async def verify_email(
    payload: EmailVerificationSchema, db: AsyncSession, redis_client: Redis
) -> MessageSchema:
    stored_code = await redis_client.get(f"otp:{payload.email}")
    if not stored_code or stored_code != payload.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired activation code.",
        )
    user = await get_user_by_email(email=payload.email, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid code."
        )
    user.is_active = True
    await db.commit()
    await redis_client.delete(f"otp:{payload.email}")
    return MessageSchema(message="Email confirmed successfully!")


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
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

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


async def reset_password(email: str, db: AsyncSession) -> MessageSchema:
    user = await get_user_by_email(email=email, db=db)
    if user:
        reset_token = create_token(email=email, purpose="password_reset")
        template = env.get_template("reset_password.html")
        body_data = {
            "html": template.render(
                reset_url=f"{settings.FRONTEND_URL}/reset-password?token={reset_token}",
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

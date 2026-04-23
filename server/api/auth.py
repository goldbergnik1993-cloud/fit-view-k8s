from fastapi import APIRouter, Depends
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from core.redis_client import get_redis
from database.session_postgresql import get_db
from schemas.user import (
    TokenPairResponse,
    LoginSchema,
    RefreshTokenRequest,
    UserRetrieveSchema,
    UserCreateSchema,
    MessageSchema,
    PasswordResetCompleteSchema,
    UserBaseSchema,
    EmailVerificationSchema
)
from services.auth import (
    user_login,
    refresh_token_pair,
    user_create,
    reset_password_confirm,
    reset_password,
    verify_email
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRetrieveSchema)
async def create_user(
        user: UserCreateSchema,
        db: AsyncSession = Depends(get_db),
        redis_client: Redis = Depends(get_redis)
):
    return await user_create(user=user, db=db, redis_client=redis_client)


@router.post("/login", response_model=TokenPairResponse)
async def login(
        payload: LoginSchema, db: AsyncSession = Depends(get_db)
):
    return await user_login(payload=payload, db=db)


@router.post(
    "/refresh",
    response_model=TokenPairResponse,
)
async def refresh_access_token(
        payload: RefreshTokenRequest,
        db: AsyncSession = Depends(get_db),
):
    token_pair = await refresh_token_pair(payload=payload, db=db)
    return token_pair



@router.post("/verify", response_model=MessageSchema)
async def confirm_email(
        payload: EmailVerificationSchema,
        db: AsyncSession = Depends(get_db),
        redis_client: Redis = Depends(get_redis)
):
    return await verify_email(
        payload=payload, db=db, redis_client=redis_client
    )


@router.post(
    "/password-reset-request",
    response_model=MessageSchema,
    summary="Initiate Password Recovery",
    description="Sends a password reset link to the user's email if the "
                "account exists."
)
async def request_password_reset(
        payload: UserBaseSchema,
        db: AsyncSession = Depends(get_db)
):
    return await reset_password(email=payload.email, db=db)


@router.post(
    "/password-reset-confirm",
    response_model=MessageSchema,
    summary="Complete Password Recovery",
    description="Updates the user password using a valid reset token provided"
                " in the recovery email."
)
async def confirm_password_reset(
        data: PasswordResetCompleteSchema,
        db: AsyncSession = Depends(get_db)
):
    return await reset_password_confirm(data=data, db=db)

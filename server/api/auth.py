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
    EmailVerificationSchema,
)
from services.auth import (
    user_login,
    refresh_token_pair,
    user_create,
    reset_password_confirm,
    reset_password,
    verify_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", summary="Create User", response_model=UserRetrieveSchema)
async def create_user(
    user: UserCreateSchema,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    """
    Registers a new user account.

    By default, all new users are assigned the `buyer` role and placed in a
    pending activation state. A 4-digit OTP will automatically be generated
    and sent to the provided email address via background tasks.
    """
    return await user_create(user=user, db=db, redis_client=redis_client)


@router.post("/login", summary="Login User", response_model=TokenPairResponse)
async def login(payload: LoginSchema, db: AsyncSession = Depends(get_db)):
    """
    Authenticates a user using their email and password.

    Returns a short-lived JWT `access_token` for authorization headers and a
    long-lived `refresh_token` to maintain session persistence.
    """
    return await user_login(payload=payload, db=db)


@router.post(
    "/refresh",
    summary="Refresh Token Pair",
    response_model=TokenPairResponse,
)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Issues a fresh JWT access token and a refresh token without requiring the
    user's password.

    The provided refresh token must be valid and not expired. This is
    typically called silently by the frontend when an access token expires.
    """
    token_pair = await refresh_token_pair(payload=payload, db=db)
    return token_pair


@router.post(
    "/verify", summary="Confirm Email Verification", response_model=MessageSchema
)
async def confirm_email(
    payload: EmailVerificationSchema,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    """
    Verifies a user's email address using the 4-digit OTP sent during registration.

    The OTP code is validated against the active Redis cache. Upon success,
    the user's `is_active` status is set to `True`, fully unlocking their account.
    """
    return await verify_email(payload=payload, db=db, redis_client=redis_client)


@router.post(
    "/password-reset-request",
    response_model=MessageSchema,
    summary="Initiate Password Recovery",
)
async def request_password_reset(
    payload: UserBaseSchema, db: AsyncSession = Depends(get_db)
):
    """
    Sends a password reset link to the user's email if the account exists.
    """
    return await reset_password(email=payload.email, db=db)


@router.post(
    "/password-reset-confirm",
    response_model=MessageSchema,
    summary="Complete Password Recovery",
)
async def confirm_password_reset(
    data: PasswordResetCompleteSchema, db: AsyncSession = Depends(get_db)
):
    """
    Updates the user password using a valid reset token provided in the recovery email.
    """
    return await reset_password_confirm(data=data, db=db)

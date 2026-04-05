from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import UserModel
from database.session_postgresql import get_db
from schemas.user import (
    UserCreateSchema,
    UserRetrieveSchema,
    LoginSchema,
    TokenPairResponse,
    RefreshTokenRequest, ProfileBaseSchema, ProfileViewSchema
)
from services.user import (
    user_create,
    user_login,
    refresh_token_pair,
    profile_create,
    get_user_profile
)

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/signup", response_model=UserRetrieveSchema)
async def create_user(
        user: UserCreateSchema, db: AsyncSession = Depends(get_db)
):
    return await user_create(user=user, db=db)


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


@router.post("/profile", response_model=ProfileViewSchema)
async def create_user_profile(
        payload: ProfileBaseSchema,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    return await profile_create(payload=payload, db=db, user=current_user)


@router.get("/profile", response_model=ProfileViewSchema)
async def my_profile(
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    return await get_user_profile(db=db, user=current_user)

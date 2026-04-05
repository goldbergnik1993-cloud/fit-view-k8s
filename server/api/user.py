from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session_postgresql import get_db
from schemas.user import (
    UserCreateSchema,
    UserRetrieveSchema,
    LoginSchema,
    TokenPairResponse,
    RefreshTokenRequest
)
from services.user import user_create, user_login, refresh_token_pair

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

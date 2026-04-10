from typing import Optional, List

from fastapi import APIRouter, Depends, Request, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import UserModel
from database.session_postgresql import get_db
from schemas.catalog import ItemFilterParams, ItemsListSchema
from schemas.user import (
    UserCreateSchema,
    UserRetrieveSchema,
    LoginSchema,
    TokenPairResponse,
    RefreshTokenRequest,
    ProfileBaseSchema,
    ProfileViewSchema, ProfileUpdateSchema,
)
from services.catalog import get_items_list
from services.user import (
    user_create,
    user_login,
    refresh_token_pair,
    profile_create,
    get_user_profile, profile_update, profile_delete
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


@router.get("/favorites", response_model=ItemsListSchema)
async def list_favorites(
        request: Request,
        db: AsyncSession = Depends(get_db),
        params: ItemFilterParams = Depends(),
        brands: Optional[List[int]] = Query(None),
        current_user: UserModel = Depends(get_current_user) # STRICT dependency
):
    filters = params.model_dump(
        exclude={"page", "per_page", "sort_by"}, exclude_none=True
    )
    if brands is not None:
        filters["brands"] = brands

    return await get_items_list(
        request=request,
        db=db,
        filters=filters,
        page=params.page,
        per_page=params.per_page,
        sort_by=params.sort_by,
        user_id=current_user.id,
        only_favorites=True
    )


@router.patch("/profile", response_model=ProfileViewSchema)
async def update_profile(
        payload: ProfileUpdateSchema,
        current_user: UserModel = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    return await profile_update(payload=payload, user=current_user, db=db)


@router.delete("/profile", status_code=status.HTTP_200_OK)
async def delete_profile(
        current_user: UserModel = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    return await profile_delete(user=current_user, db=db)

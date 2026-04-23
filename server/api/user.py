from typing import Optional, List

from fastapi import APIRouter, Depends, Request, Query
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import UserModel
from database.session_postgresql import get_db
from schemas.catalog import ItemFilterParams, ItemsListSchema
from schemas.user import ProfileViewSchema, ProfileUpdateSchema
from services.catalog import get_items_list
from services.user import get_user_profile, profile_update

router = APIRouter(prefix="/user", tags=["user"])
templates = Jinja2Templates(directory="templates")


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
        current_user: UserModel = Depends(get_current_user)
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

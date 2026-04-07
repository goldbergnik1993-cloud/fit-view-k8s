from typing import Optional, List

from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import (
    RoleChecker,
    get_current_user,
    get_optional_current_user
)

from database.models.user import UserRoleEnum, UserModel
from database.session_postgresql import get_db
from schemas.catalog import (
    ItemsListSchema,
    ItemFilterParams,
    ItemDetailSchema,
    ToggleFavoriteSchema
)
from services.catalog import get_items_list, item_view, toggle_favorite

router = APIRouter(prefix="/items", tags=["item"])

allow_moderator_plus = RoleChecker(
    [UserRoleEnum.MANAGER, UserRoleEnum.ADMIN]
)

@router.get("/", response_model=ItemsListSchema)
async def list_items(
        request: Request,
        db: AsyncSession = Depends(get_db),
        params: ItemFilterParams = Depends(),
        brands: Optional[List[int]] = Query(
            None,
            description="Search by item brands' ids (allows multiple choices)."
                        " Example: '?brands=1&brands=2&brands=3'"
        ),
        current_user: Optional[UserModel] = Depends(get_optional_current_user),
):
    filters = params.model_dump(
        exclude={"page", "per_page", "sort_by"}, exclude_none=True
    )
    if brands is not None:
        filters["brands"] = brands
    user_id = current_user.id if current_user else None

    return await get_items_list(
        request=request,
        db=db,
        filters=filters,
        page=params.page,
        per_page=params.per_page,
        sort_by=params.sort_by,
        user_id=user_id,
    )

@router.get("/{item_id}", response_model=ItemDetailSchema)
async def get_item(
        item_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: Optional[UserModel] = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    return await item_view(item_id=item_id, db=db, user_id=user_id)


@router.post("/items/{item_id}/favorite", response_model=ToggleFavoriteSchema)
async def favorite(
        item_id: int,
        current_user: UserModel = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    return await toggle_favorite(
        db=db, item_id=item_id, user_id=current_user.id
    )

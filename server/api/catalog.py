from typing import Optional, List

from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import RoleChecker

from database.models.user import UserRoleEnum
from database.session_postgresql import get_db
from schemas.catalog import (
    ItemsListSchema,
    ItemFilterParams, ItemDetailSchema
)
from services.catalog import get_items_list, item_view

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
        )
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
        sort_by=params.sort_by
    )

@router.get("/{item_id}", response_model=ItemDetailSchema)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    return await item_view(item_id=item_id, db=db)

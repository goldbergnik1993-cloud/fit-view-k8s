from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import RoleChecker

from database.models.user import UserRoleEnum
from database.session_postgresql import get_db
from schemas.catalog import (
    ItemsListSchema,
    ItemFilterParams
)
from services.catalog import get_items_list

router = APIRouter(prefix="/items", tags=["item"])

allow_moderator_plus = RoleChecker(
    [UserRoleEnum.MANAGER, UserRoleEnum.ADMIN]
)

@router.get("/", response_model=ItemsListSchema)
async def list_items(
        request: Request,
        db: AsyncSession = Depends(get_db),
        params: ItemFilterParams = Depends(),
):
    filters = params.model_dump(exclude={"page", "per_page", "sort_by"})
    return await get_items_list(
        request=request,
        db=db,
        filters=filters,
        page=params.page,
        per_page=params.per_page,
        sort_by=params.sort_by
    )

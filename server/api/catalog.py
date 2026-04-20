from typing import Optional, List

from fastapi import (
    APIRouter,
    Depends,
    Request,
    Query,
    status,
    UploadFile,
    File
)
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
    ToggleFavoriteSchema,
    FittingRoomResponseSchema,
    FittingRoomRequestSchema,
    ItemCreateSchema,
    ItemUpdateSchema,
    ItemSuggestionSchema,
    ItemListItemSchema
)
from services.catalog import (
    get_items_list,
    item_view,
    toggle_favorite,
    fitting_room,
    item_create,
    item_update,
    item_delete,
    size_chart_delete,
    measurement_delete,
    upload_item_image_service,
    get_search_autocomplete,
    get_user_recommendations
)

router = APIRouter(prefix="/items", tags=["catalog"])

allow_manager_plus = RoleChecker(
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

@router.post(
    "/",
    response_model=ItemDetailSchema,
    dependencies=[Depends(allow_manager_plus)]
)
async def create_item(
        payload: ItemCreateSchema,
        db: AsyncSession = Depends(get_db)
):
    return await item_create(payload=payload, db=db)


@router.post(
    "/upload-image",
    summary="Upload an item image",
    dependencies=[Depends(allow_manager_plus)]
)
async def upload_item_image(
    file: UploadFile = File(...)
):
    image_path = await upload_item_image_service(file)
    return {"image_url": image_path}


@router.get("/{item_id}", response_model=ItemDetailSchema)
async def get_item(
        item_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: Optional[UserModel] = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    return await item_view(item_id=item_id, db=db, user_id=user_id)


@router.patch(
    "/{item_id}",
    response_model=ItemDetailSchema,
    dependencies=[Depends(allow_manager_plus)]
)
async def update_item(
        item_id: int,
        payload: ItemUpdateSchema,
        db: AsyncSession = Depends(get_db),
):
    return await item_update(payload=payload, item_id=item_id, db=db)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)]
)
async def delete_item(
        item_id: int,
        db: AsyncSession = Depends(get_db)
):
    return await item_delete(item_id=item_id, db=db)


@router.delete(
    "/{item_id}/size_charts/{size_chart_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)]
)
async def delete_item_size_chart(
        item_id: int,
        size_chart_id: int,
        db: AsyncSession = Depends(get_db)
):
    return await size_chart_delete(
        item_id=item_id, size_chart_id=size_chart_id, db=db
    )


@router.delete(
    "/{item_id}/measurements/{measurement_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)]
)
async def delete_measurement(
        item_id: int,
        measurement_id: int,
        db: AsyncSession = Depends(get_db)
):
    return await measurement_delete(
        item_id=item_id, measurement_id=measurement_id, db=db
    )


@router.post("/{item_id}/favorite", response_model=ToggleFavoriteSchema)
async def favorite(
        item_id: int,
        current_user: UserModel = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    return await toggle_favorite(
        db=db, item_id=item_id, user_id=current_user.id
    )


@router.post(
    "/{item_id}/fitting-room", response_model=FittingRoomResponseSchema
)
async def fit_it(
        item_id: int,
        payload: FittingRoomRequestSchema,
        current_user: UserModel = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    return await fitting_room(
        user=current_user, item_id=item_id, payload=payload, db=db
    )



@router.get(
    "/search/suggestions",
    response_model=List[ItemSuggestionSchema],
    status_code=status.HTTP_200_OK
)
async def search_suggestions(
    q: str = Query(..., min_length=3, description="Search query string"),
    db: AsyncSession = Depends(get_db)
):
    return await get_search_autocomplete(query=q, db=db)


@router.get(
    "/recommendations/personalized",
    response_model=List[ItemListItemSchema],
    status_code=status.HTTP_200_OK
)
async def personalized_recommendations(
        current_user: Optional[UserModel] = Depends(get_optional_current_user),
        db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return await get_user_recommendations(user_id=user_id, db=db)

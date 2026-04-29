from typing import Optional, List

from fastapi import APIRouter, Depends, Request, Query, status, UploadFile, File
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import RoleChecker, get_current_user, get_optional_current_user
from core.redis_client import get_redis
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
    ItemListItemSchema,
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
    get_user_recommendations,
)

router = APIRouter(prefix="/items", tags=["catalog"])

allow_manager_plus = RoleChecker([UserRoleEnum.MANAGER, UserRoleEnum.ADMIN])


@router.get("/", summary="List Items", response_model=ItemsListSchema)
async def list_items(
    request: Request,
    db: AsyncSession = Depends(get_db),
    params: ItemFilterParams = Depends(),
    brands: Optional[List[int]] = Query(
        None,
        description="Search by item brands' ids (allows multiple choices)."
        " Example: '?brands=1&brands=2&brands=3'",
    ),
    current_user: Optional[UserModel] = Depends(get_optional_current_user),
):
    """
    Retrieves a paginated list of catalog items.

    Supports complex query parameters for robust storefront filtering, including:
    * Multiple brand IDs
    * Category and Gender enums
    * Size labels
    * Minimum and maximum price bounds
    * Sorting by price, popularity, or newest arrivals
    """
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
    summary="Create Item",
    response_model=ItemDetailSchema,
    dependencies=[Depends(allow_manager_plus)],
)
async def create_item(payload: ItemCreateSchema, db: AsyncSession = Depends(get_db)):
    """
    Creates a new product in the database. Requires core metadata, pricing,
    and structural data (like `reference_point` and `ref_coefficient`) to
    support the virtual fitting room logic.
    """
    return await item_create(payload=payload, db=db)


@router.post(
    "/upload-image",
    summary="Upload an item image",
    dependencies=[Depends(allow_manager_plus)],
)
async def upload_item_image(file: UploadFile = File(...)):
    image_path = await upload_item_image_service(file)
    return {"image_url": image_path}


@router.get("/{item_id}", summary="Get Item Details", response_model=ItemDetailSchema)
async def get_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[UserModel] = Depends(get_optional_current_user),
):
    """
    Fetches the complete profile of a single product. Includes all available
    size charts, physical measurements, and whether the item is currently
    favorited by the authenticated user. Also shows a list of required fields
    for the Fitting Room feature depending on the item category.
    """
    user_id = current_user.id if current_user else None
    return await item_view(item_id=item_id, db=db, user_id=user_id)


@router.patch(
    "/{item_id}",
    summary="Update Item",
    response_model=ItemDetailSchema,
    dependencies=[Depends(allow_manager_plus)],
)
async def update_item(
    item_id: int,
    payload: ItemUpdateSchema,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    """
    Partially updates a catalog item. Only the fields explicitly provided in
    the payload will be modified.
    """
    return await item_update(
        payload=payload, item_id=item_id, db=db, redis_client=redis_client
    )


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)],
)
async def delete_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    return await item_delete(item_id=item_id, db=db, redis_client=redis_client)


@router.delete(
    "/{item_id}/size_charts/{size_chart_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)],
)
async def delete_item_size_chart(
    item_id: int,
    size_chart_id: int,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    return await size_chart_delete(
        item_id=item_id,
        size_chart_id=size_chart_id,
        db=db,
        redis_client=redis_client,
    )


@router.delete(
    "/{item_id}/measurements/{measurement_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)],
)
async def delete_measurement(
    item_id: int,
    measurement_id: int,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    return await measurement_delete(
        item_id=item_id,
        measurement_id=measurement_id,
        db=db,
        redis_client=redis_client,
    )


@router.post(
    "/{item_id}/favorite",
    summary="Toggle Favorite",
    response_model=ToggleFavoriteSchema,
)
async def favorite(
    item_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Toggles the 'favorite' (wishlist) status of a specific item for the
    currently authenticated user.
    """
    return await toggle_favorite(db=db, item_id=item_id, user_id=current_user.id)


@router.post(
    "/{item_id}/fitting-room",
    summary="Run Virtual Fit Analysis",
    response_model=FittingRoomResponseSchema,
)
async def fit_it(
    item_id: int,
    payload: FittingRoomRequestSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    """
    Executes the core Virtual Fitting Room analysis engine.

    Accepts the user's specific body measurements and compares them against
    the product's internal size charts and constraints.

    Returns a highly detailed `fit_analysis` breakdown (e.g., tight, perfect,
    or loose) for individual reference points like waist, hips, breast, and
    shoulders, allowing the frontend to visually render the fit to the user.
    """
    return await fitting_room(
        user=current_user,
        item_id=item_id,
        payload=payload,
        db=db,
        redis_client=redis_client,
    )


@router.get(
    "/search/suggestions",
    summary="Search Suggestions",
    response_model=List[ItemSuggestionSchema],
    status_code=status.HTTP_200_OK,
)
async def search_suggestions(
    q: str = Query(..., min_length=3, description="Search query string"),
    db: AsyncSession = Depends(get_db),
):
    """
    Provides fast, lightweight autocomplete suggestions based on a user's
    search query string. Designed to power real-time dropdown menus in the
    frontend UI.
    """
    return await get_search_autocomplete(query=q, db=db)


@router.get(
    "/recommendations/personalized",
    summary="Personalized Recommendations",
    response_model=List[ItemListItemSchema],
    status_code=status.HTTP_200_OK,
)
async def personalized_recommendations(
    current_user: Optional[UserModel] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a curated list of items tailored to the authenticated user.
    """
    user_id = current_user.id if current_user else None
    return await get_user_recommendations(user_id=user_id, db=db)

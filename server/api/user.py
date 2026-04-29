from typing import Optional, List

from fastapi import APIRouter, Depends, Request, Query
from fastapi.templating import Jinja2Templates
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from core.redis_client import get_redis
from database.models.user import UserModel
from database.session_postgresql import get_db
from schemas.catalog import ItemFilterParams, ItemsListSchema
from schemas.user import (
    ProfileViewSchema,
    ProfileUpdateSchema,
    MessageSchema,
    EmailChangeVerificationSchema,
)
from services.catalog import get_items_list
from services.user import get_user_profile, profile_update, verify_email_change

router = APIRouter(prefix="/user", tags=["user"])
templates = Jinja2Templates(directory="templates")


@router.get(
    "/profile", summary="Retrieve User Profile", response_model=ProfileViewSchema
)
async def my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Fetches the authenticated user's complete profile, including contact
    information and saved body measurements used for the Virtual Fitting Room.
    """
    return await get_user_profile(db=db, user=current_user)


@router.get("/favorites", summary="List Favorites", response_model=ItemsListSchema)
async def list_favorites(
    request: Request,
    db: AsyncSession = Depends(get_db),
    params: ItemFilterParams = Depends(),
    brands: Optional[List[int]] = Query(None),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Retrieves a paginated list of catalog items that the authenticated user
    has marked as favorites (wishlist).

    Supports the same robust filtering and sorting query parameters as the
    main catalog storefront.
    """
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
        only_favorites=True,
    )


@router.patch("/profile", summary="Update Profile", response_model=ProfileViewSchema)
async def update_profile(
    payload: ProfileUpdateSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    """
    Updates the authenticated user's profile and body measurement data.

    **Security Note:** If an `email` field is provided in the payload, the
    email is *not* changed immediately. Instead, a pending state is created in
    Redis, and an OTP is emailed to the new address to verify ownership before
    applying the change.
    """
    return await profile_update(
        payload=payload, user=current_user, db=db, redis_client=redis_client
    )


@router.post("/change-email", summary="Change Email", response_model=MessageSchema)
async def change_email(
    payload: EmailChangeVerificationSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    """
    Finalizes a pending email address change.

    Expects the 4-digit OTP sent to the user's requested new email address.
    Validates the code against the active Redis cache and updates the core
    user record if successful.
    """
    return await verify_email_change(
        payload=payload, user=current_user, db=db, redis_client=redis_client
    )

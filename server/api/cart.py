from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.session_postgresql import get_db
from database.models.user import UserModel

from schemas.cart import CartRetrieveSchema, CartItemCreateSchema
from services.cart import (
    get_cart,
    add_item_to_cart,
    update_cart_item_quantity,
    remove_item_from_cart,
    clear_cart
)

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get(
    "/",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK
)
async def retrieve_active_cart(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_cart(user_id=current_user.id, db=db)


@router.post(
    "/items",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK
)
async def add_cart_item(
    payload: CartItemCreateSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await add_item_to_cart(
        user_id=current_user.id, payload=payload, db=db
    )


@router.patch(
    "/items/{item_id}",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK
)
async def update_item_quantity(
    item_id: int,
    quantity: int = Body(
        ..., ge=0, description="The new quantity for the item"
    ),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await update_cart_item_quantity(
        user_id=current_user.id,
        item_id=item_id,
        quantity=quantity,
        db=db
    )


@router.delete(
    "/items/{item_id}",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK
)
async def remove_cart_item(
    item_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await remove_item_from_cart(
        user_id=current_user.id, item_id=item_id, db=db
    )


@router.delete(
    "/", response_model=CartRetrieveSchema, status_code=status.HTTP_200_OK
)
async def clear_active_cart(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await clear_cart(user_id=current_user.id, db=db)

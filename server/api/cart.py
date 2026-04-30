from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.user import UserModel
from database.session_postgresql import get_db
from schemas.cart import CartRetrieveSchema, CartItemCreateSchema
from services.cart import (
    get_cart,
    add_item_to_cart,
    update_cart_item_quantity,
    remove_item_from_cart,
    clear_cart,
)

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get(
    "/",
    description="Retrieve Active Cart",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK,
)
async def retrieve_active_cart(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetches the current authenticated user's active shopping cart.

    If the user does not have an active cart, a new, empty cart session is
    automatically created and returned. The response includes all nested items,
    their current quantities, and the dynamically calculated `total_price` and
    `total_items`.
    """
    return await get_cart(user_id=current_user.id, db=db)


@router.post(
    "/items",
    summary="Add Cart Item",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK,
)
async def add_cart_item(
    payload: CartItemCreateSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Adds a specific catalog item and size variation to the active cart.

    If the exact item and `size_label` already exist in the cart, this endpoint
    will automatically increment the existing quantity rather than creating a
    duplicate entry.
    """
    return await add_item_to_cart(user_id=current_user.id, payload=payload, db=db)


@router.patch(
    "/items/{cart_item_id}",
    summary="Update Item Quantity",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK,
)
async def update_item_quantity(
    cart_item_id: int,
    quantity: int = Body(..., ge=0, description="The new quantity for the item"),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates the exact quantity of a specific item inside the cart.
    """
    return await update_cart_item_quantity(
        user_id=current_user.id, cart_item_id=cart_item_id, quantity=quantity, db=db
    )


@router.delete(
    "/items/{cart_item_id}",
    summary="Remove Cart Item",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK,
)
async def remove_cart_item(
    cart_item_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Completely removes a specific line item from the user's shopping cart,
    regardless of its current quantity.
    """
    return await remove_item_from_cart(
        user_id=current_user.id, cart_item_id=cart_item_id, db=db
    )


@router.delete(
    "/",
    summary="Clear Active Cart",
    response_model=CartRetrieveSchema,
    status_code=status.HTTP_200_OK,
)
async def clear_active_cart(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Empties the current user's active shopping cart.

    This permanently removes all items from the cart but keeps the cart
    session open and active. Returns the empty cart structure with totals
    reset to zero.
    """
    return await clear_cart(user_id=current_user.id, db=db)

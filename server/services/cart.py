from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.models.cart import CartModel, CartItemModel, CartStatusEnum
from database.models.catalog import ItemsModel
from schemas.cart import CartItemCreateSchema


def _format_cart_response(cart: CartModel) -> dict:
    total_items = sum(cart_item.quantity for cart_item in cart.cart_items)
    total_price = sum(
        float(cart_item.item.price) * cart_item.quantity
        for cart_item in cart.cart_items
    )

    for cart_item in cart.cart_items:
        is_favorite = any(
            fav.user_id == cart.user_id for fav in cart_item.item.favorites
        )

        cart_item.item.is_favorite = is_favorite  # type: ignore

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "status": cart.status,
        "created_at": cart.created_at,
        "updated_at": cart.updated_at,
        "cart_items": cart.cart_items,
        "total_items": total_items,
        "total_price": total_price,
    }


async def _get_or_create_active_cart(user_id: int, db: AsyncSession) -> CartModel:
    stmt = (
        select(CartModel)
        .where(CartModel.user_id == user_id, CartModel.status == CartStatusEnum.ACTIVE)
        .options(
            selectinload(CartModel.cart_items)
            .selectinload(CartItemModel.item)
            .options(selectinload(ItemsModel.brand), selectinload(ItemsModel.favorites))
        )
        .execution_options(populate_existing=True)
    )
    cart = await db.scalar(stmt)

    if not cart:
        cart = CartModel(user_id=user_id, status=CartStatusEnum.ACTIVE)
        db.add(cart)
        await db.commit()

        cart = await db.scalar(stmt)

    return cart


async def get_cart(user_id: int, db: AsyncSession) -> dict:
    cart = await _get_or_create_active_cart(user_id, db)
    return _format_cart_response(cart)


async def add_item_to_cart(
    user_id: int, payload: CartItemCreateSchema, db: AsyncSession
) -> dict:
    item_stmt = select(ItemsModel).where(ItemsModel.id == payload.item_id)
    item_db = await db.scalar(item_stmt)
    if not item_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {payload.item_id} not found in catalog.",
        )

    cart = await _get_or_create_active_cart(user_id, db)

    existing_cart_item = next(
        (
            ci
            for ci in cart.cart_items
            if ci.item_id == payload.item_id and ci.size_label == payload.size_label
        ),
        None,
    )

    try:
        if existing_cart_item:
            existing_cart_item.quantity += payload.quantity
        else:
            new_cart_item = CartItemModel(
                cart_id=cart.id,
                item_id=payload.item_id,
                size_label=payload.size_label,
                quantity=payload.quantity,
            )
            db.add(new_cart_item)

        await db.commit()

        updated_cart = await _get_or_create_active_cart(user_id, db)
        return _format_cart_response(updated_cart)

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add item to cart.",
        )


async def update_cart_item_quantity(
    user_id: int, cart_item_id: int, quantity: int, db: AsyncSession
) -> dict:
    cart = await _get_or_create_active_cart(user_id, db)
    cart_item = next((ci for ci in cart.cart_items if ci.id == cart_item_id), None)
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found in your cart.",
        )

    try:
        if quantity <= 0:
            await db.delete(cart_item)
        else:
            cart_item.quantity = quantity
        await db.commit()
        updated_cart = await _get_or_create_active_cart(user_id, db)
        return _format_cart_response(updated_cart)

    except SQLAlchemyError as e:
        await db.rollback()
        print(f"DATABASE ERROR in update_cart_item_quantity: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cart item.",
        )


async def remove_item_from_cart(
    user_id: int, cart_item_id: int, db: AsyncSession
) -> dict:
    return await update_cart_item_quantity(user_id, cart_item_id, 0, db)


async def clear_cart(user_id: int, db: AsyncSession) -> dict:
    cart = await _get_or_create_active_cart(user_id, db)

    if not cart.cart_items:
        return _format_cart_response(cart)

    try:
        for cart_item in cart.cart_items:
            await db.delete(cart_item)

        await db.commit()

        cleared_cart = await _get_or_create_active_cart(user_id, db)
        return _format_cart_response(cleared_cart)

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear the cart.",
        )

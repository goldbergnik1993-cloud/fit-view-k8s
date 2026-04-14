from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from database.models import FavoritesModel
from database.models.orders import OrderModel, OrderItemModel, OrderStatusEnum
from database.models.cart import CartModel, CartItemModel, CartStatusEnum
from database.models.catalog import ItemsModel
from schemas.orders import OrderCreateSchema


async def create_order_from_cart(
        user_id: int, payload: OrderCreateSchema, db: AsyncSession
) -> OrderModel:
    stmt = (
        select(CartModel)
        .where(
            CartModel.user_id == user_id,
            CartModel.status == CartStatusEnum.ACTIVE
        )
        .options(
            selectinload(CartModel.cart_items).selectinload(CartItemModel.item)
        )
    )
    cart = await db.scalar(stmt)

    if not cart or not cart.cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create an order from an empty cart."
        )

    try:
        total_amount = 0.0
        order_items_to_create = []

        for cart_item in cart.cart_items:
            current_price = float(cart_item.item.price)
            total_amount += current_price * cart_item.quantity

            order_items_to_create.append(
                OrderItemModel(
                    item_id=cart_item.item_id,
                    size_label=cart_item.size_label,
                    quantity=cart_item.quantity,
                    price_at_purchase=current_price
                )
            )

            fav_stmt = select(FavoritesModel).where(
                FavoritesModel.user_id == user_id,
                FavoritesModel.item_id == cart_item.item_id
            )
            favorite_db = await db.scalar(fav_stmt)
            if favorite_db:
                favorite_db.converted = True
                await db.flush()

        new_order = OrderModel(
            user_id=user_id,
            total_amount=total_amount,
            delivery_info=payload.delivery_info.model_dump(),
            status=OrderStatusEnum.PENDING
        )

        db.add(new_order)
        await db.flush()

        for order_item in order_items_to_create:
            order_item.order_id = new_order.id
            db.add(order_item)

        cart.status = CartStatusEnum.CONVERTED

        await db.commit()

        return await get_order_by_id(
            user_id=user_id, order_id=new_order.id, db=db
        )

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while processing your order."
        )


async def get_user_orders(user_id: int, db: AsyncSession) -> list[OrderModel]:
    stmt = (
        select(OrderModel)
        .where(OrderModel.user_id == user_id)
        .order_by(OrderModel.created_at.desc())
        .options(
            selectinload(OrderModel.order_items).selectinload(
                OrderItemModel.item)
            .options(
                selectinload(ItemsModel.brand),
            )
        )
    )
    result = await db.scalars(stmt)
    return list(result)


async def get_order_by_id(
        user_id: int, order_id: int, db: AsyncSession
) -> OrderModel:
    stmt = (
        select(OrderModel)
        .where(
            OrderModel.id == order_id,
            OrderModel.user_id == user_id
        )
        .options(
            selectinload(OrderModel.order_items).selectinload(
                OrderItemModel.item)
            .options(
                selectinload(ItemsModel.brand),
            )
        )
        .execution_options(populate_existing=True)
    )
    order = await db.scalar(stmt)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    return order

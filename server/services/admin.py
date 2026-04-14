from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import UserModel, OrderModel
from database.models.user import UserRoleEnum
from schemas.orders import OrderStatusUpdateSchema


async def change_user_role(
        target_user: UserModel,
        new_role: UserRoleEnum,
        current_admin: UserModel,
        db: AsyncSession
) -> UserModel:
    if target_user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot modify your own administrative role."
        )

    if target_user.role == new_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already assigned to the '{new_role.value}' role."
        )

    target_user.role = new_role

    try:
        await db.commit()
        await db.refresh(target_user)
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the user role."
        )

    return target_user


async def admin_update_order_status(
        order_id: int,
        payload: OrderStatusUpdateSchema,
        db: AsyncSession
) -> OrderModel:
    stmt = select(OrderModel).where(OrderModel.id == order_id)
    order = await db.scalar(stmt)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    try:
        order.status = payload.status
        await db.commit()

        return order

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status."
        )

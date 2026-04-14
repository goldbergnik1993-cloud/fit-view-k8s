from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.session_postgresql import get_db
from database.models.user import UserModel

from schemas.orders import OrderCreateSchema, OrderRetrieveSchema
from services.orders import (
    create_order_from_cart,
    get_user_orders,
    get_order_by_id
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "/",
    response_model=OrderRetrieveSchema,
    status_code=status.HTTP_201_CREATED
)
async def place_order(
    payload: OrderCreateSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_order_from_cart(
        user_id=current_user.id, payload=payload, db=db
    )


@router.get(
    "/",
    response_model=List[OrderRetrieveSchema],
    status_code=status.HTTP_200_OK
)
async def list_my_orders(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_user_orders(user_id=current_user.id, db=db)


@router.get(
    "/{order_id}",
    response_model=OrderRetrieveSchema,
    status_code=status.HTTP_200_OK
)
async def retrieve_order_details(
    order_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_order_by_id(
        user_id=current_user.id, order_id=order_id, db=db
    )

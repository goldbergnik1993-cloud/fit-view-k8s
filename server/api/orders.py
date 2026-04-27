from typing import List

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import get_current_user
from database.models.payments import PaymentStatusEnum
from database.models.user import UserModel
from database.session_postgresql import get_db
from schemas.orders import OrderCreateSchema, OrderRetrieveSchema
from schemas.payments import CheckoutSessionResponseSchema
from services.orders import create_order_from_cart, get_user_orders, get_order_by_id
from services.payments import create_checkout_session

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post(
    "/",
    summary="Place Order",
    response_model=OrderRetrieveSchema,
    status_code=status.HTTP_201_CREATED
)
async def place_order(
    payload: OrderCreateSchema,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Converts the user's active shopping cart into a finalized order.

    Accepts the user's selected delivery information, locks in the current prices of the items, transitions the cart to a 'Converted' state, and generates a new Order in a 'Pending' payment state.
    """
    return await create_order_from_cart(user_id=current_user.id, payload=payload, db=db)


@router.get(
    "/",
    summary="List My Orders",
    response_model=List[OrderRetrieveSchema],
    status_code=status.HTTP_200_OK
)
async def list_my_orders(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves the complete order history for the currently authenticated user.

    Includes nested data for all purchased items, historical pricing at the
    time of purchase, and current fulfillment status.
    """
    return await get_user_orders(user_id=current_user.id, db=db)


@router.get(
    "/{order_id}",
    summary="Retrieve Order Details",
    response_model=OrderRetrieveSchema,
    status_code=status.HTTP_200_OK
)
async def retrieve_order_details(
    order_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetches the full details of a specific order belonging to the authenticated user.
    """
    return await get_order_by_id(user_id=current_user.id, order_id=order_id, db=db)


@router.post(
    "/{order_id}/checkout",
    summary="Trigger Checkout",
    response_model=CheckoutSessionResponseSchema,
    status_code=status.HTTP_200_OK,
)
async def trigger_checkout(
    order_id: int,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Initializes a secure Stripe Checkout session for a pending order.

    Calculates the final total server-side to prevent tampering, initializes a
    `PaymentsModel` record, and returns a secure, temporary `checkout_url`
    where the frontend should redirect the user to complete payment.
    """
    order = await get_order_by_id(user_id=user.id, order_id=order_id, db=db)
    if order.payment and order.payment.status == PaymentStatusEnum.SUCCESSFUL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already paid."
        )
    return await create_checkout_session(order=order, db=db)

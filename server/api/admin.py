from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependencies import RoleChecker, get_user_by_email
from database.models.user import UserRoleEnum, UserModel
from database.session_postgresql import get_db
from schemas.admin import ChangeUserRoleSchema
from schemas.orders import OrderRetrieveSchema, OrderStatusUpdateSchema
from services.admin import change_user_role, admin_update_order_status

router = APIRouter(prefix="/admin", tags=["admin"])

allow_admin_only = RoleChecker([UserRoleEnum.ADMIN])
allow_manager_plus = RoleChecker([UserRoleEnum.MANAGER, UserRoleEnum.ADMIN])


@router.patch(
    "/change-user-role",
    summary="Update User Role",
    description="Modifies the permission level of a user (e.g., upgrading a "
    "Buyer to Manager or Admin).",
)
async def change_user_status(
    payload: ChangeUserRoleSchema,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(allow_admin_only),
):
    user_db = await get_user_by_email(payload.user_email, db=db)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    updated_user = await change_user_role(
        target_user=user_db,
        new_role=payload.user_role,
        current_admin=current_user,
        db=db,
    )

    return {
        "message": f"User with ID {updated_user.id} (email: {updated_user.email}"
        f") has been assigned to {updated_user.role.value}"
    }


@router.patch(
    "/{order_id}/status",
    response_model=OrderRetrieveSchema,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_manager_plus)]
)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdateSchema,
    db: AsyncSession = Depends(get_db),
):
    return await admin_update_order_status(
        order_id=order_id, payload=payload, db=db
    )

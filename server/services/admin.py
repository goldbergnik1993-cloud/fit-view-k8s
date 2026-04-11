from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import UserModel
from database.models.user import UserRoleEnum


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

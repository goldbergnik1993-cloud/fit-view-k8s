from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from database.models import UserModel
from database.models.events import FitviewEventsModel, EventTypeEnum
from schemas.events import FitViewEventCreateSchema


async def log_fitview_event(
        payload: FitViewEventCreateSchema,
        user: UserModel,
        db: AsyncSession
) -> None:
    if payload.event_type == EventTypeEnum.RESULT_SHOWN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Result shown events are handled automatically by the calculation engine."
        )

    new_event = FitviewEventsModel(
        user_id=user.id,
        item_id=payload.item_id,
        event_type=payload.event_type,
        height_used_cm=payload.height_used_cm,
        result_end_cm=None,
        fit_shoulders=None,
        fit_breast=None,
        fit_waist=None,
        fit_hips=None,
        ab_group=user.ab_group
    )

    db.add(new_event)
    await db.commit()
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database.models import UserModel
from database.session_postgresql import get_db
from core.dependencies import get_current_user
from schemas.events import FitViewEventCreateSchema
from services.events import log_fitview_event

router = APIRouter(prefix="/events", tags=["analytics"])

@router.post("/fitview", status_code=status.HTTP_201_CREATED)
async def track_fitview_interaction(
    payload: FitViewEventCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    await log_fitview_event(payload=payload, user=current_user, db=db)
    return {"status": "event_logged"}

from sqlalchemy import update

from core.logging_config import logger
from database.models import FitviewEventsModel, FavoritesModel
from database.models.events import EventTypeEnum
from database.session_postgresql import SessionLocal


async def save_fitting_room_telemetry(
    user_id: int, item_id: int, fit_data: dict, ab_group: str
):
    async with SessionLocal() as db:
        try:
            new_event = FitviewEventsModel(
                user_id=user_id,
                item_id=item_id,
                event_type=EventTypeEnum.RESULT_SHOWN,
                height_used_cm=fit_data["height_cm"],
                result_end_cm=fit_data["h_end_cm"],
                fit_shoulders=fit_data["shoulders_fit"],
                fit_breast=fit_data["breast_fit"],
                fit_waist=fit_data["waist_fit"],
                fit_hips=fit_data["hips_fit"],
                ab_group=ab_group,
            )
            db.add(new_event)
            await db.flush()
            await db.execute(
                update(FavoritesModel)
                .where(
                    FavoritesModel.user_id == user_id,
                    FavoritesModel.item_id == item_id,
                    FavoritesModel.used_fitview.is_(False),
                )
                .values(used_fitview=True)
            )

            await db.commit()

        except Exception as e:
            logger.error("background_telemetry_failed", error=str(e), user_id=user_id)

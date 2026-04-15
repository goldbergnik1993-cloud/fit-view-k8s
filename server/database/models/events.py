import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, ForeignKey, String, Float, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base


class EventTypeEnum(enum.Enum):
    WIDGET_SHOWN = "widget_shown"
    HEIGHT_ENTERED = "height_entered"
    RESULT_SHOWN = "result_shown"


class FitResultEnum(str, enum.Enum):
    TIGHT = "tight"
    PERFECT = "perfect"
    LOOSE = "loose"


class FitviewEventsModel(Base):
    __tablename__ = "fitview_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="SET NULL")
    )
    event_type: Mapped[EventTypeEnum] = mapped_column(Enum(EventTypeEnum))
    height_used_cm: Mapped[Optional[float]] = mapped_column(Float)
    result_end_cm: Mapped[Optional[float]] = mapped_column(Float)
    fit_shoulders: Mapped[Optional[FitResultEnum]] = mapped_column(
        Enum(FitResultEnum)
    )
    fit_breast: Mapped[Optional[FitResultEnum]] = mapped_column(
        Enum(FitResultEnum)
    )
    fit_waist: Mapped[Optional[FitResultEnum]] = mapped_column(
        Enum(FitResultEnum)
    )
    fit_hips: Mapped[Optional[FitResultEnum]] = mapped_column(
        Enum(FitResultEnum)
    )
    ab_group: Mapped[str] = mapped_column(String(1))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now()
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel", back_populates="events"
    )
    item: Mapped["ItemsModel"] = relationship(
        "ItemsModel", back_populates="events"
    )

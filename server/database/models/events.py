from datetime import datetime

from sqlalchemy import Integer, ForeignKey, String, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base


class FitviewEventsModel(Base):
    __tablename__ = "fitview_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE")
    )
    event_type: Mapped[str] = mapped_column(String(50))
    height_used_cm: Mapped[float] = mapped_column(Float)
    result_end_cm: Mapped[float] = mapped_column(Float)
    fit_shoulders: Mapped[str] = mapped_column(String(10))
    fit_breast: Mapped[str] = mapped_column(String(10))
    fit_waist: Mapped[str] = mapped_column(String(10))
    fit_hips: Mapped[str] = mapped_column(String(10))
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

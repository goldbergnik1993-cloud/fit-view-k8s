from datetime import datetime

from sqlalchemy import Integer, ForeignKey, String, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base


class FitviewEventsModel(Base):
    __tablename__ = "fitview_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(255), nullable=True)
    height_used_cm: Mapped[float] = mapped_column(Float, nullable=True)
    result_end_cm: Mapped[float] = mapped_column(Float, nullable=True)
    result_label: Mapped[str] = mapped_column(String(10), nullable=True)
    ab_group: Mapped[str] = mapped_column(String(1), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now()
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel", back_populates="events"
    )
    item: Mapped["ItemModel"] = relationship(
        "ItemModel", back_populates="events"
    )

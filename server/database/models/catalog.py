import enum
from datetime import datetime
from typing import List

from sqlalchemy import (
    Integer,
    String,
    Enum,
    Float,
    ForeignKey,
    Boolean,
    DateTime,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base


class ItemCategoryEnum(str, enum.Enum):
    DRESS = "dress"
    SKIRT = "skirt"
    T_SHIRT = "t_shirt"
    BLOUSE = "blouse"
    PANTS = "pants"
    SHIRT = "shirt"


class ItemsModel(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    brand: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[ItemCategoryEnum] = mapped_column(Enum(ItemCategoryEnum), index=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    reference_point: Mapped[str] = mapped_column(String(255))
    ref_coefficient: Mapped[float] = mapped_column(Float)

    size_charts: Mapped[List["SizeChartModel"]] = relationship(
        "SizeChartModel",
        back_populates="item",
        cascade="all, delete-orphan"
    )
    favorites: Mapped[List["FavoriteModel"]] = relationship(
        "FavoriteModel",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    events: Mapped[List["FitviewEventsModel"]] = relationship(
        "FitviewEventsModel", back_populates="item"
    )


class SizeChartModel(Base):
    __tablename__ = "size_charts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    size_label: Mapped[str] = mapped_column(String(10))

    waist_min_cm: Mapped[int] = mapped_column(Integer, index=True)
    waist_max_cm: Mapped[int] = mapped_column(Integer, index=True)

    breast_min_cm: Mapped[int] = mapped_column(Integer, index=True)
    breast_max_cm: Mapped[int] = mapped_column(Integer, index=True)
    shoulders_min_cm: Mapped[int] = mapped_column(Integer, index=True)
    shoulders_max_cm: Mapped[int] = mapped_column(Integer, index=True)

    item: Mapped["ItemsModel"] = relationship(
        "ItemsModel", back_populates="size_charts"
    )


class ItemMeasurementsModel(Base):
    __tablename__ = "item_measurements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"))
    size_label: Mapped[str] = mapped_column(String(10))
    total_length_cm: Mapped[float] = mapped_column(Float)
    inseam_cm: Mapped[float] = mapped_column(Float)

    item: Mapped["ItemsModel"] = relationship(
        "ItemsModel", back_populates="measurements"
    )


class FavoritesModel(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"),
        nullable=False
    )
    used_fitview: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    converted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now()
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel", back_populates="favorites"
    )
    item: Mapped["ItemsModel"] = relationship(
        "ItemsModel", back_populates="favorites"
    )

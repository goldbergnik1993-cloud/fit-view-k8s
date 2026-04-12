import enum
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    Integer,
    String,
    Enum,
    Float,
    ForeignKey,
    Boolean,
    DateTime,
    func,
    DECIMAL,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base
from database.models.user import GenderEnum


class ItemCategoryEnum(str, enum.Enum):
    DRESS = "dress"
    SKIRT = "skirt"
    T_SHIRT = "t_shirt"
    BLOUSE = "blouse"
    PANTS = "pants"
    SHIRT = "shirt"


class ItemRefPointEnum(str, enum.Enum):
    SHOULDERS = "shoulders"
    WAIST = "waist"
    CROTCH = "crotch"


class BrandsModel(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[String] = mapped_column(String(50), unique=True, index=True)

    items: Mapped[List["ItemsModel"]] = relationship(
        "ItemsModel",
        back_populates="brand",
        cascade="all, delete-orphan"
    )


class ItemsModel(Base):
    __tablename__ = "items"
    __table_args__ = (
        UniqueConstraint(
            "name", "brand_id", "category", name="uix_items"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"))
    category: Mapped[ItemCategoryEnum] = mapped_column(
        Enum(ItemCategoryEnum), index=True
    )
    gender: Mapped[GenderEnum] = mapped_column(Enum(GenderEnum), index=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    price: Mapped[Decimal] = mapped_column(
        DECIMAL(10, 2), default=Decimal("0.00")
    )
    reference_point: Mapped[ItemRefPointEnum] = mapped_column(
        Enum(ItemRefPointEnum)
    )
    ref_coefficient: Mapped[float] = mapped_column(Float)

    brand: Mapped["BrandsModel"] = relationship(
        "BrandsModel", back_populates="items"
    )
    size_charts: Mapped[List["SizeChartModel"]] = relationship(
        "SizeChartModel",
        back_populates="item",
        cascade="all, delete-orphan"
    )
    measurements: Mapped[List["ItemMeasurementsModel"]] = relationship(
        "ItemMeasurementsModel",
        back_populates="item",
        cascade="all, delete-orphan"
    )
    favorites: Mapped[List["FavoritesModel"]] = relationship(
        "FavoritesModel",
        back_populates="item",
        cascade="all, delete-orphan"
    )
    events: Mapped[List["FitviewEventsModel"]] = relationship(
        "FitviewEventsModel", back_populates="item"
    )


class SizeChartModel(Base):
    __tablename__ = "size_charts"
    __table_args__ = (
        UniqueConstraint(
            "item_id", "size_label", name="uix_item_size_chart"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    size_label: Mapped[str] = mapped_column(String(10))

    hips_min_cm: Mapped[Optional[float]] = mapped_column(Float)
    hips_max_cm: Mapped[Optional[float]] = mapped_column(Float)

    waist_min_cm: Mapped[Optional[float]] = mapped_column(Float)
    waist_max_cm: Mapped[Optional[float]] = mapped_column(Float)

    breast_min_cm: Mapped[Optional[float]] = mapped_column(Float)
    breast_max_cm: Mapped[Optional[float]] = mapped_column(Float)

    shoulders_min_cm: Mapped[Optional[float]] = mapped_column(Float)
    shoulders_max_cm: Mapped[Optional[float]] = mapped_column(Float)

    item: Mapped["ItemsModel"] = relationship(
        "ItemsModel", back_populates="size_charts"
    )


class ItemMeasurementsModel(Base):
    __tablename__ = "item_measurements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE")
    )
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

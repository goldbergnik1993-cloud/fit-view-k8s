from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database.models.cart import CartModel
    from database.models.catalog import FavoritesModel
    from database.models.events import FitviewEventsModel
    from database.models.orders import OrderModel
import enum
from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import Integer, String, func, DateTime, Enum, ForeignKey, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base


class UserRoleEnum(str, enum.Enum):
    BUYER = "buyer"
    MANAGER = "manager"
    ADMIN = "admin"


class GenderEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    role: Mapped[UserRoleEnum] = mapped_column(
        Enum(UserRoleEnum), default=UserRoleEnum.BUYER
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )
    ab_group: Mapped[str] = mapped_column(String(1))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

    profile: Mapped[Optional["UserProfileModel"]] = relationship(
        "UserProfileModel",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    refresh_tokens: Mapped[List["RefreshTokenModel"]] = relationship(
        "RefreshTokenModel", back_populates="user", cascade="all, delete-orphan"
    )
    favorites: Mapped[List["FavoritesModel"]] = relationship(
        "FavoritesModel", back_populates="user", cascade="all, delete-orphan"
    )
    events: Mapped[List["FitviewEventsModel"]] = relationship(
        "FitviewEventsModel", back_populates="user"
    )
    carts: Mapped["CartModel"] = relationship(
        "CartModel", back_populates="user", cascade="all, delete-orphan"
    )
    orders: Mapped["OrderModel"] = relationship(
        "OrderModel", back_populates="user", cascade="all, delete-orphan"
    )


class UserProfileModel(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))
    phone_number: Mapped[str] = mapped_column(String(50))
    birth_date: Mapped[date] = mapped_column(Date, nullable=True)
    height_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    gender: Mapped[GenderEnum] = mapped_column(
        Enum(GenderEnum), default=GenderEnum.FEMALE
    )
    leg_length_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    waist_length_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    hips_length_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    breast_length_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    shoulders_length_cm: Mapped[int] = mapped_column(Integer, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped[List["UserModel"]] = relationship(
        "UserModel", back_populates="profile"
    )


class RefreshTokenModel(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel", back_populates="refresh_tokens"
    )

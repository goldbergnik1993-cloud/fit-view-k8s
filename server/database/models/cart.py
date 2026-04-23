from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from database.models.user import UserModel
    from database.models.catalog import ItemsModel
import enum
from datetime import datetime

from sqlalchemy import (
    Integer,
    ForeignKey,
    DateTime,
    func,
    UniqueConstraint,
    Enum,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class CartStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    CONVERTED = "Converted"
    ABANDONED = "Abandoned"


class CartModel(Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[CartStatusEnum] = mapped_column(
        Enum(CartStatusEnum), default=CartStatusEnum.ACTIVE
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="carts")
    cart_items: Mapped[list["CartItemModel"]] = relationship(
        "CartItemModel", back_populates="cart", cascade="all, delete-orphan"
    )


class CartItemModel(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "item_id", "size_label", name="uix_cart_item_size"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.id", ondelete="CASCADE"))
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"))
    size_label: Mapped[str] = mapped_column(String(10))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    cart: Mapped["CartModel"] = relationship("CartModel", back_populates="cart_items")
    item: Mapped["ItemsModel"] = relationship("ItemsModel", back_populates="cart_items")

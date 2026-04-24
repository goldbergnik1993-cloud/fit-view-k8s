from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database.models.user import UserModel
    from database.models.catalog import ItemsModel
    from database.models.payments import PaymentsModel
import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, ForeignKey, Enum, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models.base import Base


class OrderStatusEnum(str, enum.Enum):
    PENDING = "Pending"
    PAID = "Paid"
    SHIPPED = "Shipped"
    DELIVERED = "Delivered"
    CANCELED = "Canceled"
    RETURNED = "Returned"


class OrderModel(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[OrderStatusEnum] = mapped_column(
        Enum(OrderStatusEnum), default=OrderStatusEnum.PENDING
    )
    delivery_info: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped[Optional["UserModel"]] = relationship(
        "UserModel", back_populates="orders"
    )
    order_items: Mapped[list["OrderItemModel"]] = relationship(
        "OrderItemModel",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    payment: Mapped[Optional["PaymentsModel"]] = relationship(
        "PaymentsModel", back_populates="order", lazy="selectin"
    )


class OrderItemModel(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    item_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("items.id", ondelete="SET NULL"), nullable=True
    )
    size_label: Mapped[str] = mapped_column(String(10))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price_at_purchase: Mapped[float] = mapped_column(Numeric(10, 2))

    order: Mapped["OrderModel"] = relationship(
        "OrderModel", back_populates="order_items"
    )
    item: Mapped[Optional["ItemsModel"]] = relationship("ItemsModel")

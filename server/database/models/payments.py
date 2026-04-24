from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from database.models.orders import OrderModel
    from database.models.user import UserModel
import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Integer, ForeignKey, Enum, Numeric, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.models import Base


class PaymentStatusEnum(enum.Enum):
    PENDING = "pending"
    SUCCESSFUL = "successful"
    CANCELED = "canceled"
    REFUNDED = "refunded"


class PaymentsModel(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    order_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("orders.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[PaymentStatusEnum] = mapped_column(
        Enum(PaymentStatusEnum), index=True, default=PaymentStatusEnum.PENDING
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="usd")
    external_payment_id: Mapped[str] = mapped_column(String(100), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )

    user: Mapped[Optional["UserModel"]] = relationship(
        "UserModel", back_populates="payments"
    )
    order: Mapped[Optional["OrderModel"]] = relationship(
        "OrderModel", back_populates="payment"
    )

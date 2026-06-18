import uuid
from sqlalchemy import Column, String, Numeric, Integer, DateTime, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Add constraints
    __table_args__ = (
        CheckConstraint("price > 0", name="check_product_price_positive"),
        CheckConstraint("quantity_in_stock >= 0", name="check_product_quantity_non_negative"),
    )

    # Relationships
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")

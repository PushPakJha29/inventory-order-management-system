from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import List, Optional

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")

class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    quantity: int
    unit_price: Decimal
    product_name: Optional[str] = None
    sku: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: str
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must contain at least one item")

class OrderResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: Optional[str] = None
    total_amount: Decimal
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional

class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0, description="Price must be greater than zero")
    quantity_in_stock: int = Field(..., ge=0, description="Quantity cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

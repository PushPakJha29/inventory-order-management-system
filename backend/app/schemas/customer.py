from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: Optional[str] = Field(None, max_length=50)

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

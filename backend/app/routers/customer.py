from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services.customer import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return CustomerService.get_all_customers(db)

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    return CustomerService.get_customer_by_id(db, customer_id)

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService.create_customer(db, customer_in)

@router.delete("/{customer_id}", response_model=CustomerResponse)
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    return CustomerService.delete_customer(db, customer_id)

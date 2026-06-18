from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return OrderService.get_all_orders(db)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    return OrderService.get_order_by_id(db, order_id)

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    return OrderService.create_order(db, order_in)

@router.delete("/{order_id}", response_model=OrderResponse)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    return OrderService.delete_order(db, order_id)

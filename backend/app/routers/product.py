from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product import ProductService

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return ProductService.get_all_products(db)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    return ProductService.get_product_by_id(db, product_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    return ProductService.create_product(db, product_in)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, product_in: ProductUpdate, db: Session = Depends(get_db)):
    return ProductService.update_product(db, product_id, product_in)

@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    return ProductService.delete_product(db, product_id)

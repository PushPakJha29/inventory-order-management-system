from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.exceptions import EntityNotFoundException, DuplicateEntityException

class ProductService:
    @staticmethod
    def get_all_products(db: Session):
        return db.query(Product).order_by(Product.product_name).all()

    @staticmethod
    def get_product_by_id(db: Session, product_id: str):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise EntityNotFoundException(f"Product with ID {product_id} not found")
        return product

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate):
        # Check SKU uniqueness manually to provide cleaner API message prior to DB error
        existing = db.query(Product).filter(Product.sku == product_in.sku).first()
        if existing:
            raise DuplicateEntityException("Product SKU must be unique")
            
        db_product = Product(
            product_name=product_in.product_name,
            sku=product_in.sku,
            price=product_in.price,
            quantity_in_stock=product_in.quantity_in_stock
        )
        db.add(db_product)
        try:
            db.commit()
            db.refresh(db_product)
            return db_product
        except IntegrityError:
            db.rollback()
            raise DuplicateEntityException("Product SKU must be unique")

    @staticmethod
    def update_product(db: Session, product_id: str, product_in: ProductUpdate):
        db_product = ProductService.get_product_by_id(db, product_id)
        
        # Check SKU uniqueness if it's changing
        if product_in.sku is not None and product_in.sku != db_product.sku:
            existing = db.query(Product).filter(Product.sku == product_in.sku).first()
            if existing:
                raise DuplicateEntityException("Product SKU must be unique")
                
        update_data = product_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
            
        try:
            db.commit()
            db.refresh(db_product)
            return db_product
        except IntegrityError:
            db.rollback()
            raise DuplicateEntityException("Product SKU must be unique")

    @staticmethod
    def delete_product(db: Session, product_id: str):
        db_product = ProductService.get_product_by_id(db, product_id)
        
        # Check if there are order items referencing this product
        if len(db_product.order_items) > 0:
            raise DuplicateEntityException("Cannot delete product as it is referenced in orders")
            
        db.delete(db_product)
        db.commit()
        return db_product

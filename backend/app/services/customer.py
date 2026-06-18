from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate
from app.utils.exceptions import EntityNotFoundException, DuplicateEntityException

class CustomerService:
    @staticmethod
    def get_all_customers(db: Session):
        return db.query(Customer).order_by(Customer.full_name).all()

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: str):
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise EntityNotFoundException(f"Customer with ID {customer_id} not found")
        return customer

    @staticmethod
    def create_customer(db: Session, customer_in: CustomerCreate):
        # Check email uniqueness manually
        existing = db.query(Customer).filter(Customer.email == customer_in.email).first()
        if existing:
            raise DuplicateEntityException("Customer email must be unique")
            
        db_customer = Customer(
            full_name=customer_in.full_name,
            email=customer_in.email,
            phone_number=customer_in.phone_number
        )
        db.add(db_customer)
        try:
            db.commit()
            db.refresh(db_customer)
            return db_customer
        except IntegrityError:
            db.rollback()
            raise DuplicateEntityException("Customer email must be unique")

    @staticmethod
    def delete_customer(db: Session, customer_id: str):
        db_customer = CustomerService.get_customer_by_id(db, customer_id)
        
        # Check if customer has orders
        if len(db_customer.orders) > 0:
            raise DuplicateEntityException("Cannot delete customer as they have active orders")
            
        db.delete(db_customer)
        db.commit()
        return db_customer

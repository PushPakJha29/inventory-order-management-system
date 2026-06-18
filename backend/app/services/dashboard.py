from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order

class DashboardService:
    @staticmethod
    def get_stats(db: Session):
        total_products = db.query(Product).count()
        total_customers = db.query(Customer).count()
        total_orders = db.query(Order).count()
        
        # Low stock products are defined as quantity_in_stock <= 5
        low_stock_products = db.query(Product).filter(Product.quantity_in_stock <= 5).count()
        
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_products": low_stock_products
        }

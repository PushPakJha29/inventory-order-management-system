import os
import sys
from decimal import Decimal
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Load dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "backend", ".env"))

from app.database.session import engine, SessionLocal, Base
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

def seed_database():
    print("Connecting to database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Clear existing data to allow re-seeding
        print("Clearing existing data...")
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Customer).delete()
        db.query(Product).delete()
        db.commit()
        
        # 1. Seed 10 products
        print("Seeding products...")
        products = [
            Product(product_name="Pro Laptop 15", sku="PROD-LAP-01", price=Decimal("1249.99"), quantity_in_stock=15),
            Product(product_name="Max Smartphone", sku="PROD-PHN-02", price=Decimal("799.50"), quantity_in_stock=25),
            Product(product_name="Noise-Cancelling Headphones", sku="PROD-HDP-03", price=Decimal("199.99"), quantity_in_stock=4), # Low Stock
            Product(product_name="UltraWide Monitor 34", sku="PROD-MON-04", price=Decimal("349.99"), quantity_in_stock=8),
            Product(product_name="Mechanical Keyboard", sku="PROD-KYB-05", price=Decimal("89.99"), quantity_in_stock=40),
            Product(product_name="Ergonomic Wireless Mouse", sku="PROD-MSE-06", price=Decimal("59.99"), quantity_in_stock=3), # Low Stock
            Product(product_name="Smart Fitness Watch", sku="PROD-WCH-07", price=Decimal("149.00"), quantity_in_stock=12),
            Product(product_name="Graphics Tablet 10", sku="PROD-TAB-08", price=Decimal("299.99"), quantity_in_stock=18),
            Product(product_name="Portable Bluetooth Speaker", sku="PROD-SPK-09", price=Decimal("79.99"), quantity_in_stock=2), # Low Stock
            Product(product_name="Gigabit Wi-Fi Router", sku="PROD-RTR-10", price=Decimal("119.50"), quantity_in_stock=30),
        ]
        db.add_all(products)
        db.flush() # Populate IDs for linking orders
        
        # 2. Seed 10 customers
        print("Seeding customers...")
        customers = [
            Customer(full_name="Alice Johnson", email="alice.j@example.com", phone_number="+1 (555) 019-2834"),
            Customer(full_name="Bob Smith", email="bob.smith@example.com", phone_number="+1 (555) 014-9382"),
            Customer(full_name="Charlie Brown", email="charlie.b@example.com", phone_number="+1 (555) 017-4930"),
            Customer(full_name="Diana Prince", email="diana.p@example.com", phone_number="+1 (555) 012-3849"),
            Customer(full_name="Evan Wright", email="evan.wright@example.com", phone_number="+1 (555) 016-8302"),
            Customer(full_name="Fiona Gallagher", email="fiona.g@example.com", phone_number="+1 (555) 015-7492"),
            Customer(full_name="George Clark", email="george.c@example.com", phone_number="+1 (555) 018-9302"),
            Customer(full_name="Hannah Abbott", email="hannah.a@example.com", phone_number="+1 (555) 013-4829"),
            Customer(full_name="Ian Malcolm", email="ian.m@example.com", phone_number="+1 (555) 011-2948"),
            Customer(full_name="Julia Roberts", email="julia.r@example.com", phone_number="+1 (555) 010-9284"),
        ]
        db.add_all(customers)
        db.flush()
        
        # Map by index for easy lookup
        prod_map = {p.sku: p for p in products}
        cust_map = {c.email: c for c in customers}
        
        # 3. Seed sample orders
        print("Seeding orders...")
        
        # Order 1: Alice buys a laptop and headphones
        p_lap = prod_map["PROD-LAP-01"]
        p_hdp = prod_map["PROD-HDP-03"]
        o1_total = (p_lap.price * 1) + (p_hdp.price * 2)
        order1 = Order(customer_id=cust_map["alice.j@example.com"].id, total_amount=o1_total)
        db.add(order1)
        db.flush()
        db.add_all([
            OrderItem(order_id=order1.id, product_id=p_lap.id, quantity=1, unit_price=p_lap.price),
            OrderItem(order_id=order1.id, product_id=p_hdp.id, quantity=2, unit_price=p_hdp.price)
        ])
        # Deduct stock
        p_lap.quantity_in_stock -= 1
        p_hdp.quantity_in_stock -= 2
        
        # Order 2: Bob buys a smartphone and keyboard
        p_phn = prod_map["PROD-PHN-02"]
        p_kyb = prod_map["PROD-KYB-05"]
        o2_total = (p_phn.price * 1) + (p_kyb.price * 1)
        order2 = Order(customer_id=cust_map["bob.smith@example.com"].id, total_amount=o2_total)
        db.add(order2)
        db.flush()
        db.add_all([
            OrderItem(order_id=order2.id, product_id=p_phn.id, quantity=1, unit_price=p_phn.price),
            OrderItem(order_id=order2.id, product_id=p_kyb.id, quantity=1, unit_price=p_kyb.price)
        ])
        p_phn.quantity_in_stock -= 1
        p_kyb.quantity_in_stock -= 1
        
        # Order 3: Charlie buys a monitor and a mouse
        p_mon = prod_map["PROD-MON-04"]
        p_mse = prod_map["PROD-MSE-06"]
        o3_total = (p_mon.price * 2) + (p_mse.price * 1)
        order3 = Order(customer_id=cust_map["charlie.b@example.com"].id, total_amount=o3_total)
        db.add(order3)
        db.flush()
        db.add_all([
            OrderItem(order_id=order3.id, product_id=p_mon.id, quantity=2, unit_price=p_mon.price),
            OrderItem(order_id=order3.id, product_id=p_mse.id, quantity=1, unit_price=p_mse.price)
        ])
        p_mon.quantity_in_stock -= 2
        p_mse.quantity_in_stock -= 1
        
        db.commit()
        print("Database seeding completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

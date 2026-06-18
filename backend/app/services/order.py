from sqlalchemy.orm import Session
from decimal import Decimal
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate
from app.utils.exceptions import EntityNotFoundException, InsufficientInventoryException

class OrderService:
    @staticmethod
    def get_all_orders(db: Session):
        # Join to eager load customers and order items
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        # Add helper fields for Response schema mapping
        for order in orders:
            order.customer_name = order.customer.full_name if order.customer else "Unknown"
            for item in order.items:
                item.product_name = item.product.product_name if item.product else "Unknown"
                item.sku = item.product.sku if item.product else ""
        return orders

    @staticmethod
    def get_order_by_id(db: Session, order_id: str):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise EntityNotFoundException(f"Order with ID {order_id} not found")
            
        order.customer_name = order.customer.full_name if order.customer else "Unknown"
        for item in order.items:
            item.product_name = item.product.product_name if item.product else "Unknown"
            item.sku = item.product.sku if item.product else ""
        return order

    @staticmethod
    def create_order(db: Session, order_in: OrderCreate):
        # 1. Verify customer exists
        customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
        if not customer:
            raise EntityNotFoundException(f"Customer with ID {order_in.customer_id} not found")
            
        total_amount = Decimal("0.00")
        order_items_to_create = []
        products_to_update = []
        
        # We process each item in a transaction
        try:
            for item in order_in.items:
                # 2. Verify product exists
                # Lock the product row for update to prevent concurrent stock issues (select_for_update)
                product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if not product:
                    raise EntityNotFoundException(f"Product with ID {item.product_id} not found")
                
                # 3. Verify inventory available
                if product.quantity_in_stock < item.quantity:
                    raise InsufficientInventoryException(
                        f"Insufficient inventory for product '{product.product_name}'. "
                        f"Requested: {item.quantity}, Available: {product.quantity_in_stock}"
                    )
                
                # 4. Calculate item price and add to total
                item_total = product.price * item.quantity
                total_amount += item_total
                
                # 5. Deduct stock
                product.quantity_in_stock -= item.quantity
                products_to_update.append(product)
                
                # Prepare OrderItem database object
                db_item = OrderItem(
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.price
                )
                order_items_to_create.append((db_item, product.product_name, product.sku))
            
            # Create Order database object
            db_order = Order(
                customer_id=customer.id,
                total_amount=total_amount
            )
            db.add(db_order)
            db.flush() # Generate db_order.id
            
            # Save order items and assign order_id
            for db_item, p_name, p_sku in order_items_to_create:
                db_item.order_id = db_order.id
                db.add(db_item)
                
            # Commit the transaction (this updates products stock, inserts order & order items)
            db.commit()
            db.refresh(db_order)
            
            # Format return schema properties
            db_order.customer_name = customer.full_name
            for db_item, p_name, p_sku in order_items_to_create:
                db_item.product_name = p_name
                db_item.sku = p_sku
                
            return db_order
            
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def delete_order(db: Session, order_id: str):
        # 1. Fetch order
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise EntityNotFoundException(f"Order with ID {order_id} not found")
            
        try:
            # 2. Restore stock for all products in this order
            for item in order.items:
                product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if product:
                    product.quantity_in_stock += item.quantity
                    db.add(product)
                    
            # 3. Delete order (cascades to order items)
            db.delete(order)
            db.commit()
            return order
        except Exception as e:
            db.rollback()
            raise e

from app.routers.product import router as product_router
from app.routers.customer import router as customer_router
from app.routers.order import router as order_router
from app.routers.dashboard import router as dashboard_router

__all__ = ["product_router", "customer_router", "order_router", "dashboard_router"]

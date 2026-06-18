import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv

# Load env variables
load_dotenv()

from app.database.session import engine, Base
from app.routers import product_router, customer_router, order_router, dashboard_router
from app.utils.exceptions import (
    APIException,
    api_exception_handler,
    validation_exception_handler,
    integrity_exception_handler,
    general_exception_handler
)

# Initialize database schema (runs when backend starts)
# Note: For production systems, migration tools like Alembic are preferred,
# but automatic table creation is ideal for ease of setup and direct deployments.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Backend API for managing products, customers, orders and stock levels",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS (Cross-Origin Resource Sharing)
# In production, specify specific domains for security, but allow all origins for dev/easy setup.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(product_router, prefix="/api")
app.include_router(customer_router, prefix="/api")
app.include_router(order_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "inventory-order-system"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

class APIException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class EntityNotFoundException(APIException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)

class InsufficientInventoryException(APIException):
    def __init__(self, message: str = "Insufficient inventory"):
        super().__init__(message, status_code=400)

class DuplicateEntityException(APIException):
    def __init__(self, message: str = "Entity already exists"):
        super().__init__(message, status_code=400)

# Exception handlers
async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message}
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Format validation errors nicely
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        errors.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": "; ".join(errors)
        }
    )

async def integrity_exception_handler(request: Request, exc: IntegrityError):
    # Handle SQLAlchemy database integrity errors (unique SKU, unique email, etc.)
    orig_msg = str(exc.orig).lower()
    message = "Database integrity violation."
    
    if "sku" in orig_msg:
        message = "Product SKU must be unique"
    elif "email" in orig_msg:
        message = "Customer email must be unique"
    elif "check_product_price_positive" in orig_msg:
        message = "Price must be greater than zero"
    elif "check_product_quantity_non_negative" in orig_msg:
        message = "Product quantity cannot be negative"
        
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": message}
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": f"Internal server error: {str(exc)}"}
    )

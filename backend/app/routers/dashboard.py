from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return DashboardService.get_stats(db)

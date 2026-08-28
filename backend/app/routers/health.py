from fastapi import APIRouter, Depends
from ..schemas.health import HealthResponse
from ..database import get_db, check_health
from ..config import settings

router = APIRouter(prefix="/health", tags=["health"])

@router.get("", response_model=HealthResponse)
def health_check():
    db_status = "ok" if check_health() else "error"
    return HealthResponse(
        status="ok",
        database=db_status,
        version=settings.app_version
    )

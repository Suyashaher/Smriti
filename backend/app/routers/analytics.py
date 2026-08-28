from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.schemas.analytics import PatientAnalyticsResponse
from app.services.analytics_service import get_patient_analytics
from app.api.deps import verify_caregiver_access

router = APIRouter(prefix="/analytics", tags=["analytics"])

from app.database import get_db

@router.get("/{patientId}", response_model=PatientAnalyticsResponse)
def get_analytics(
    patientId: str, 
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    caregiver_id: str = Depends(verify_caregiver_access),
    db = Depends(get_db)
):
    if end_date is None:
        end_date = datetime.now(timezone.utc)
    if start_date is None:
        start_date = end_date - timedelta(days=30)
        
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    if end_date.tzinfo is None:
        end_date = end_date.replace(tzinfo=timezone.utc)
        
    return get_patient_analytics(db, patientId, start_date, end_date)

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.database import get_db
from app.schemas.alert import AlertResponse
from app.services.alert_engine import evaluate_patient_alerts, acknowledge_alert
from app.api.deps import verify_caregiver_access

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/{patientId}", response_model=List[AlertResponse])
def get_alerts(patientId: str, caregiver_id: str = Depends(verify_caregiver_access), db = Depends(get_db)):
    evaluate_patient_alerts(db, patientId)
    
    alerts = list(db.alerts.find({"patientId": patientId}).sort("createdAt", -1))
    return alerts

@router.post("/{patientId}/{alertId}/acknowledge", response_model=AlertResponse)
def ack_alert(patientId: str, alertId: str, caregiver_id: str = Depends(verify_caregiver_access), db = Depends(get_db)):
    alert = db.alerts.find_one({"id": alertId, "patientId": patientId})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    acknowledge_alert(db, alertId, caregiver_id)
    return db.alerts.find_one({"id": alertId})

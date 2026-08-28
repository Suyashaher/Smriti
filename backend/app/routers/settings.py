from fastapi import APIRouter, HTTPException, Depends
from ..schemas.settings import PatientSettingsCreate, PatientSettingsResponse
from ..database import get_db
from datetime import datetime, timezone

router = APIRouter(prefix="/patients/{patient_id}/settings", tags=["settings"])

@router.get("", response_model=PatientSettingsResponse)
def get_settings(patient_id: str, db = Depends(get_db)):
    doc = db.patient_settings.find_one({"patientId": patient_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    doc.pop("_id", None)
    return doc

@router.put("", response_model=PatientSettingsResponse)
def update_settings(patient_id: str, settings_data: PatientSettingsCreate, db = Depends(get_db)):
    if patient_id != settings_data.patientId:
        raise HTTPException(status_code=400, detail="Mismatching patientId")
        
    doc = settings_data.model_dump()
    now = datetime.now(timezone.utc).isoformat()
    
    existing = db.patient_settings.find_one({"patientId": patient_id})
    if existing:
        doc["createdAt"] = existing.get("createdAt", now)
        doc["updatedAt"] = now
        db.patient_settings.replace_one({"patientId": patient_id}, doc)
    else:
        doc["createdAt"] = now
        doc["updatedAt"] = now
        db.patient_settings.insert_one(doc)
        
    doc.pop("_id", None)
    return doc

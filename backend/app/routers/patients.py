from fastapi import APIRouter, HTTPException, Depends
from typing import Any
from ..schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from ..database import get_db
from datetime import datetime, timezone

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db = Depends(get_db)):
    doc = patient.model_dump()
    now = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    
    try:
        db.patients.insert_one(doc)
    except Exception:
        raise HTTPException(status_code=400, detail="Patient id already exists")
    
    doc.pop("_id", None)
    return doc

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db = Depends(get_db)):
    doc = db.patients.find_one({"id": patient_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    doc.pop("_id", None)
    return doc

@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: str, update_data: PatientUpdate, db = Depends(get_db)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        return get_patient(patient_id, db)
        
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    res = db.patients.update_one({"id": patient_id}, {"$set": update_dict})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return get_patient(patient_id, db)

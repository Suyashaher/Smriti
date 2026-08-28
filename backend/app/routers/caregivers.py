from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from app.database import get_db
from app.schemas.caregiver import CaregiverCreate, CaregiverResponse, PatientAssignment
from app.api.deps import get_caregiver_id

router = APIRouter(prefix="/caregivers", tags=["caregivers"])

@router.post("", response_model=CaregiverResponse)
def create_caregiver(caregiver: CaregiverCreate, db = Depends(get_db)):
    if db.caregivers.find_one({"email": caregiver.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_caregiver = {
        "id": str(uuid.uuid4()),
        "name": caregiver.name,
        "email": caregiver.email,
        "createdAt": datetime.now(timezone.utc)
    }
    db.caregivers.insert_one(new_caregiver)
    return new_caregiver

@router.post("/{caregiver_id}/patients/{patient_id}", response_model=PatientAssignment)
def assign_patient(caregiver_id: str, patient_id: str, relationship: Optional[str] = None, db = Depends(get_db)):
    if not db.caregivers.find_one({"id": caregiver_id}):
        raise HTTPException(status_code=404, detail="Caregiver not found")
    if not db.patients.find_one({"id": patient_id}):
        # Auto-create placeholder patient for newly paired devices
        now = datetime.now(timezone.utc)
        db.patients.insert_one({
            "id": patient_id,
            "displayName": "Demo Patient",
            "preferredLanguage": "en",
            "contentPack": "generic",
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat()
        })
        
    mapping = {
        "patientId": patient_id,
        "caregiverId": caregiver_id,
        "assignedAt": datetime.now(timezone.utc),
        "relationship": relationship
    }
    
    try:
        db.patient_caregiver.insert_one(mapping)
    except Exception:
        raise HTTPException(status_code=400, detail="Assignment already exists")
        
    return mapping

from app.schemas.caregiver import CaregiverCreate, CaregiverResponse, PatientAssignment, PatientSummaryResponse

@router.get("/{caregiver_id}/patients", response_model=List[PatientSummaryResponse])
def list_assigned_patients(caregiver_id: str, x_caregiver_id: str = Depends(get_caregiver_id), db = Depends(get_db)):
    if caregiver_id != x_caregiver_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    assignments = list(db.patient_caregiver.find({"caregiverId": caregiver_id}))
    
    results = []
    for assign in assignments:
        pid = assign["patientId"]
        
        # Get patient name
        patient_doc = db.patients.find_one({"id": pid})
        name = patient_doc["displayName"] if patient_doc else "Unknown Patient"
        
        # Get last active (most recent sync event)
        recent_sync = db.sync_events.find_one({"patientId": pid}, sort=[("timestamp", -1)])
        last_active = recent_sync["timestamp"] if recent_sync else assign["assignedAt"].isoformat()
        
        # Get status (check for unacknowledged ACTION_REQUIRED alerts)
        critical_alerts = db.alerts.count_documents({
            "patientId": pid,
            "severity": "ACTION_REQUIRED",
            "acknowledged": False
        })
        status = "needs_attention" if critical_alerts > 0 else "stable"
        
        results.append(PatientSummaryResponse(
            id=pid,
            name=name,
            lastActive=last_active,
            status=status
        ))
        
    return results

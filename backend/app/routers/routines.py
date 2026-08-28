from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..schemas.routine import RoutineCreate, RoutineUpdate, RoutineResponse
from ..database import get_db
from datetime import datetime, timezone

router = APIRouter(tags=["routines"])

@router.get("/patients/{patient_id}/routine", response_model=List[RoutineResponse])
def get_routine(patient_id: str, db = Depends(get_db)):
    cursor = db.routines.find({"patientId": patient_id})
    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)
    return results

@router.post("/routines", response_model=RoutineResponse)
def create_routine(routine: RoutineCreate, db = Depends(get_db)):
    doc = routine.model_dump()
    existing = db.routines.find_one({"id": doc["id"]})
    if existing:
        existing.pop("_id", None)
        return existing
        
    now = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    
    db.routines.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.patch("/routines/{routine_id}", response_model=RoutineResponse)
def update_routine(routine_id: str, update_data: RoutineUpdate, db = Depends(get_db)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        doc = db.routines.find_one({"id": routine_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Routine not found")
        doc.pop("_id", None)
        return doc
        
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    res = db.routines.update_one({"id": routine_id}, {"$set": update_dict})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Routine not found")
        
    doc = db.routines.find_one({"id": routine_id})
    doc.pop("_id", None)
    return doc

@router.delete("/routines/{routine_id}", status_code=204)
def delete_routine(routine_id: str, db = Depends(get_db)):
    res = db.routines.delete_one({"id": routine_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Routine not found")
    return None

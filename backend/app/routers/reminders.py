from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse, ReminderEventCreate, ReminderEventResponse
from ..database import get_db
from datetime import datetime, timezone

router = APIRouter(tags=["reminders"])

@router.get("/patients/{patient_id}/reminders", response_model=List[ReminderResponse])
def get_reminders(patient_id: str, db = Depends(get_db)):
    cursor = db.reminders.find({"patientId": patient_id})
    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)
    return results

@router.post("/reminders", response_model=ReminderResponse)
def create_reminder(reminder: ReminderCreate, db = Depends(get_db)):
    doc = reminder.model_dump()
    existing = db.reminders.find_one({"id": doc["id"]})
    if existing:
        existing.pop("_id", None)
        return existing
        
    now = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    
    db.reminders.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.patch("/reminders/{reminder_id}", response_model=ReminderResponse)
def update_reminder(reminder_id: str, update_data: ReminderUpdate, db = Depends(get_db)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        doc = db.reminders.find_one({"id": reminder_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Reminder not found")
        doc.pop("_id", None)
        return doc
        
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    res = db.reminders.update_one({"id": reminder_id}, {"$set": update_dict})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
        
    doc = db.reminders.find_one({"id": reminder_id})
    doc.pop("_id", None)
    return doc

@router.delete("/reminders/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: str, db = Depends(get_db)):
    res = db.reminders.delete_one({"id": reminder_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return None

@router.post("/reminders/{reminder_id}/events", response_model=ReminderEventResponse)
def create_reminder_event(reminder_id: str, event: ReminderEventCreate, db = Depends(get_db)):
    doc = event.model_dump()
    if doc["reminderId"] != reminder_id:
        raise HTTPException(status_code=400, detail="Mismatching reminderId")
        
    existing = db.reminder_events.find_one({"id": doc["id"]})
    if existing:
        existing.pop("_id", None)
        return existing
        
    now = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    
    db.reminder_events.insert_one(doc)
    doc.pop("_id", None)
    return doc

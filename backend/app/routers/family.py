from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import List
from datetime import datetime, timezone
import uuid
import os
import shutil
from pathlib import Path

from app.database import get_db
from app.api.deps import verify_caregiver_access
from app.schemas.family import FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberResponse

router = APIRouter(prefix="/family-members", tags=["family"])
patients_router = APIRouter(prefix="/patients/{patient_id}/family-members", tags=["family"])

UPLOAD_DIR = Path("uploads/family_photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("", response_model=FamilyMemberResponse)
def create_family_member(member: FamilyMemberCreate, db=Depends(get_db)):
    doc = member.model_dump()
    doc["id"] = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    doc["synced"] = True
    
    db.family_members.insert_one(doc)
    doc.pop("_id", None)
    return doc

@patients_router.get("", response_model=List[FamilyMemberResponse])
def get_family_members(patient_id: str, db=Depends(get_db)):
    cursor = db.family_members.find({"patientId": patient_id})
    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)
    return results

@router.patch("/{member_id}", response_model=FamilyMemberResponse)
def update_family_member(member_id: str, update_data: FamilyMemberUpdate, db=Depends(get_db)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        doc = db.family_members.find_one({"id": member_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Family member not found")
        doc.pop("_id", None)
        return doc
        
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    res = db.family_members.update_one({"id": member_id}, {"$set": update_dict})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Family member not found")
        
    doc = db.family_members.find_one({"id": member_id})
    doc.pop("_id", None)
    return doc

@router.delete("/{member_id}")
def delete_family_member(member_id: str, db=Depends(get_db)):
    # First get member to potentially delete photo
    doc = db.family_members.find_one({"id": member_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Family member not found")
        
    if doc.get("photoId"):
        photo_path = UPLOAD_DIR / doc["photoId"]
        if photo_path.exists():
            photo_path.unlink()
            
    res = db.family_members.delete_one({"id": member_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Family member not found")
    return {"status": "ok"}

@router.post("/{member_id}/photo")
def upload_photo(member_id: str, file: UploadFile = File(...), db=Depends(get_db)):
    doc = db.family_members.find_one({"id": member_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Family member not found")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    # Simple file saving, could add resizing later
    extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    photo_id = f"{member_id}.{extension}"
    file_path = UPLOAD_DIR / photo_id
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update member with photoId
    db.family_members.update_one(
        {"id": member_id},
        {"$set": {"photoId": photo_id, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"status": "ok", "photoId": photo_id}

@router.get("/{member_id}/photo")
def get_photo(member_id: str, db=Depends(get_db)):
    doc = db.family_members.find_one({"id": member_id})
    if not doc or not doc.get("photoId"):
        raise HTTPException(status_code=404, detail="Photo not found")
        
    file_path = UPLOAD_DIR / doc["photoId"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Photo file not found")
        
    return FileResponse(file_path)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import uuid
from datetime import datetime, timezone
from app.database import get_db
from app.api.security import verify_password, get_password_hash, create_access_token
from app.schemas.caregiver import CaregiverCreate, CaregiverResponse, Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=CaregiverResponse)
def register(caregiver_in: CaregiverCreate, db = Depends(get_db)):
    if db.caregivers.find_one({"email": caregiver_in.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(caregiver_in.password)
    
    new_caregiver = {
        "id": str(uuid.uuid4()),
        "name": caregiver_in.name,
        "email": caregiver_in.email,
        "hashed_password": hashed_password,
        "createdAt": datetime.now(timezone.utc)
    }
    
    db.caregivers.insert_one(new_caregiver)
    
    # Do not return the hash
    return CaregiverResponse(
        id=new_caregiver["id"],
        name=new_caregiver["name"],
        email=new_caregiver["email"],
        createdAt=new_caregiver["createdAt"]
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    # form_data.username is used for email
    user = db.caregivers.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=60*24*7) # 7 days
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

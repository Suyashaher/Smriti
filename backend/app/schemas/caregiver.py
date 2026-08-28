from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CaregiverCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CaregiverResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    createdAt: datetime

class PatientAssignment(BaseModel):
    patientId: str
    caregiverId: str
    assignedAt: datetime
    relationship: Optional[str] = None

class PatientSummaryResponse(BaseModel):
    id: str
    name: str
    lastActive: str
    status: str

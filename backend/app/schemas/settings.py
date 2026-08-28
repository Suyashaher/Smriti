from pydantic import BaseModel
from typing import Optional
from .common import UTCBaseModel

class PatientSettingsCreate(BaseModel):
    patientId: str
    language: str
    voiceEnabled: bool
    speechOutputEnabled: bool
    speechInputEnabled: bool
    speechRate: float

class PatientSettingsResponse(PatientSettingsCreate, UTCBaseModel):
    createdAt: str
    updatedAt: str

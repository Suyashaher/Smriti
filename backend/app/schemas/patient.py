from pydantic import BaseModel
from typing import Optional
from .common import UTCBaseModel

class PatientCreate(BaseModel):
    id: str
    displayName: str
    preferredLanguage: str = "en"
    contentPack: str = "generic"

class PatientUpdate(BaseModel):
    displayName: Optional[str] = None
    preferredLanguage: Optional[str] = None
    contentPack: Optional[str] = None

class PatientResponse(PatientCreate, UTCBaseModel):
    createdAt: str
    updatedAt: str

from pydantic import BaseModel
from typing import List, Optional
from .common import UTCBaseModel

class RoutineTaskSchema(BaseModel):
    id: str
    time: str
    titleKey: str
    icon: str
    sortOrder: int
    completedToday: bool

class RoutineCreate(BaseModel):
    id: str
    patientId: str
    items: List[RoutineTaskSchema]

class RoutineUpdate(BaseModel):
    items: Optional[List[RoutineTaskSchema]] = None

class RoutineResponse(RoutineCreate, UTCBaseModel):
    createdAt: str
    updatedAt: str

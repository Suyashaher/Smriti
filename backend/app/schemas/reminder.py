from pydantic import BaseModel
from typing import Literal, Optional, List
from .common import UTCBaseModel

class RecurrenceRule(BaseModel):
    frequency: Literal['daily', 'weekly']
    daysOfWeek: Optional[List[int]] = None

class ReminderCreate(BaseModel):
    id: str
    patientId: str
    type: Literal['medicine', 'hydration', 'meal', 'activity', 'appointment']
    titleKey: str
    schedule: str
    recurrence: Optional[RecurrenceRule] = None

class ReminderUpdate(BaseModel):
    type: Optional[Literal['medicine', 'hydration', 'meal', 'activity', 'appointment']] = None
    titleKey: Optional[str] = None
    schedule: Optional[str] = None
    recurrence: Optional[RecurrenceRule] = None

class ReminderResponse(ReminderCreate, UTCBaseModel):
    createdAt: str
    updatedAt: str

class ReminderEventCreate(BaseModel):
    id: str
    reminderId: str
    patientId: str
    scheduledAt: str
    status: Literal['scheduled', 'completed', 'skipped', 'missed']
    completedAt: Optional[str] = None

class ReminderEventResponse(ReminderEventCreate, UTCBaseModel):
    createdAt: str
    updatedAt: str

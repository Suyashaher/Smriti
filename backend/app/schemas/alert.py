from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ACTION_REQUIRED = "ACTION_REQUIRED"

class AlertStatus(str, Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class AlertResponse(BaseModel):
    id: str
    patientId: str
    caregiverId: Optional[str] = None
    severity: AlertSeverity
    type: str
    message: str
    status: AlertStatus
    createdAt: datetime
    updatedAt: Optional[datetime] = None

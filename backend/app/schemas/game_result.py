from pydantic import BaseModel, Field
from typing import Literal, Optional
from .common import UTCBaseModel

class GameResultCreate(BaseModel):
    id: str
    patientId: str
    gameId: Literal["memory_cards", "object_recognition", "pattern_recognition", "daily_routine_recall", "attention"]
    score: float = Field(ge=0)
    accuracy: float = Field(ge=0, le=1)
    responseTime: float = Field(ge=0)
    attempts: int = Field(ge=1)
    difficulty: int = Field(ge=1, le=10)
    completed: bool
    timestamp: str

class GameResultResponse(GameResultCreate, UTCBaseModel):
    deviceId: Optional[str] = None
    syncedAt: Optional[str] = None
    createdAt: str
    updatedAt: str

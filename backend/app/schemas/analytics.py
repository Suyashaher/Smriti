from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GameAnalytics(BaseModel):
    totalGamesPlayed: int
    averageScore: float
    accuracyTrend: str

class ReminderAnalytics(BaseModel):
    totalScheduled: int
    completed: int
    missed: int
    completionRate: float

class RoutineAnalytics(BaseModel):
    totalRoutines: int
    completed: int
    missed: int
    completionRate: float

class TrendData(BaseModel):
    date: str
    score: Optional[float] = None
    completionRate: Optional[float] = None

class PatientAnalyticsResponse(BaseModel):
    patientId: str
    periodStart: datetime
    periodEnd: datetime
    games: GameAnalytics
    reminders: ReminderAnalytics
    routines: RoutineAnalytics
    trends: List[TrendData]

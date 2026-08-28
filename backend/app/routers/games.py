from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from ..schemas.game_result import GameResultCreate, GameResultResponse
from ..database import get_db
from datetime import datetime, timezone

router = APIRouter(prefix="/game-results", tags=["games"])
router2 = APIRouter(prefix="/patients/{patient_id}/game-results", tags=["games"])

@router.post("", response_model=GameResultResponse)
def create_game_result(result: GameResultCreate, db = Depends(get_db)):
    doc = result.model_dump()
    existing = db.game_results.find_one({"id": doc["id"]})
    if existing:
        existing.pop("_id", None)
        return existing
        
    now = datetime.now(timezone.utc).isoformat()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    
    db.game_results.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router2.get("", response_model=List[GameResultResponse])
def get_game_results(
    patient_id: str,
    gameId: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db = Depends(get_db)
):
    query = {"patientId": patient_id}
    if gameId:
        query["gameId"] = gameId
    
    if from_date or to_date:
        query["timestamp"] = {}
        if from_date:
            query["timestamp"]["$gte"] = from_date
        if to_date:
            query["timestamp"]["$lte"] = to_date
            
    cursor = db.game_results.find(query).sort("timestamp", -1).limit(limit)
    
    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)
        
    return results

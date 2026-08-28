from fastapi import APIRouter, Depends
from ..schemas.sync import SyncBatchRequest, SyncBatchResponse, SyncItemResult
from ..database import get_db
from datetime import datetime, timezone

router = APIRouter(prefix="/sync", tags=["sync"])

@router.post("", response_model=SyncBatchResponse)
def sync_operations(request: SyncBatchRequest, db = Depends(get_db)):
    results = []
    now = datetime.now(timezone.utc).isoformat()
    
    # Update device lastSyncAt
    db.devices.update_one(
        {"deviceId": request.deviceId},
        {"$set": {"lastSyncAt": now}},
        upsert=True
    )
    
    for op in request.operations:
        # Idempotency check
        existing_event = db.sync_events.find_one({"id": op.id})
        if existing_event:
            results.append(SyncItemResult(operationId=op.id, status="SYNCED"))
            continue
            
        try:
            payload = op.payload
            payload["updatedAt"] = now
            if "createdAt" not in payload:
                payload["createdAt"] = now
                
            collection_name = None
            id_field = "id"
            
            if op.type == "GAME_RESULT":
                collection_name = "game_results"
            elif op.type == "REMINDER":
                collection_name = "reminders"
            elif op.type == "REMINDER_EVENT":
                collection_name = "reminder_events"
            elif op.type == "ROUTINE":
                collection_name = "routines"
            elif op.type == "PATIENT_SETTINGS":
                collection_name = "patient_settings"
                id_field = "patientId"
            
            if collection_name:
                db[collection_name].update_one(
                    {id_field: payload[id_field]},
                    {"$set": payload},
                    upsert=True
                )
            
            # Log event
            db.sync_events.insert_one({
                "id": op.id,
                "type": op.type,
                "patientId": op.patientId,
                "timestamp": op.timestamp,
                "processedAt": now,
                "deviceId": request.deviceId
            })
            
            results.append(SyncItemResult(operationId=op.id, status="SYNCED"))
        except Exception as e:
            results.append(SyncItemResult(operationId=op.id, status="FAILED", error=str(e)))
            
    return SyncBatchResponse(results=results)

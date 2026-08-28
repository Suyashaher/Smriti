from pydantic import BaseModel
from typing import Literal, List, Dict, Any, Optional

class SyncOperationItem(BaseModel):
    id: str
    type: str
    patientId: str
    timestamp: str
    payload: Dict[str, Any]

class SyncBatchRequest(BaseModel):
    deviceId: str
    operations: List[SyncOperationItem]

class SyncItemResult(BaseModel):
    operationId: str
    status: Literal['SYNCED', 'FAILED']
    error: Optional[str] = None

class SyncBatchResponse(BaseModel):
    results: List[SyncItemResult]

from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, ConfigDict, field_validator

class UTCBaseModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    @field_validator('*', mode='before')
    @classmethod
    def parse_datetime(cls, value: Any) -> Any:
        if isinstance(value, str):
            try:
                dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.isoformat()
            except ValueError:
                pass
        if isinstance(value, datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            return value.isoformat()
        return value

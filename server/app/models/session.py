from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Literal

class Session(BaseModel):
    """
    Represents a measurement session.
    """
    session_id: UUID = Field(..., alias="sessionId")
    created_at: datetime = Field(..., alias="createdAt")
    status: Literal["created", "active", "ended"]
    viewer_url: str = Field(..., alias="viewerUrl")
    websocket_url: str = Field(..., alias="websocketUrl")

    class Config:
        allow_population_by_field_name = True
        orm_mode = True

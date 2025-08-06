from pydantic import BaseModel, Field

class Sample(BaseModel):
    """
    A single raw accelerometer data point.
    """
    t: float
    ax: float
    ay: float
    az: float

class SamplesBatch(BaseModel):
    """
    A batch of samples sent from the client.
    """
    samples: list[Sample]

class WebSocketMessage(BaseModel):
    """
    Defines the structure for WebSocket messages.
    """
    type: str
    payload: SamplesBatch

from pydantic import BaseModel

class Error(BaseModel):
    """
    A standard error response model.
    """
    detail: str

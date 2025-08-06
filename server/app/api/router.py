from fastapi import APIRouter
from app.api.endpoints import session

api_router = APIRouter()

# Include all endpoint routers here
api_router.include_router(session.router, tags=["Session"])

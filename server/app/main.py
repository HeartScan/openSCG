from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import initialize_database, get_db
from app.core.logging import setup_logging
from fastapi import Depends
from psycopg import Connection
from app.api.router import api_router
from app.api.endpoints import websocket
from app.shared.limiter import limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Actions on startup
    setup_logging()
    initialize_database()
    yield
    # Actions on shutdown (if any)

app = FastAPI(
    title="OpenSCG Server",
    description="A modern, high-performance, and open-source server for real-time seismocardiography (SCG) signal acquisition and streaming.",
    version="1.0.0",
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the OpenSCG API"}

@app.get("/health")
def health_check(db: Connection = Depends(get_db)):
    try:
        # Perform a simple query to check DB connection
        with db.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {"status": "ok", "database": db_status}

# Include the main API router
app.include_router(api_router, prefix="/api/v1")
app.include_router(websocket.router)

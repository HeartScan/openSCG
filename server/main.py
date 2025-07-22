import uuid
import json
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from database import get_db_connection, initialize_database
from dotenv import load_dotenv
import os

load_dotenv()
from processing import preprocess_web_signal
import numpy as np

app = FastAPI(
    title="OpenSCG Server",
    description="Real-time server for OpenSCG project.",
    version="0.1.0",
)

@app.on_event("startup")
def on_startup():
    initialize_database()

# CORS Middleware
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://open-scg.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        self.active_connections[session_id].remove(websocket)

    async def broadcast(self, message: str, session_id: str):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    # Root endpoint
    return {"message": "Welcome to OpenSCG Server"}

@app.get("/health")
def health_check():
    # Health check endpoint, final final version
    return {"status": "ok"}

# Create a router for the API endpoints
api_router = APIRouter(prefix="/api/v1")

@api_router.post("/sessions")
async def create_session():
    session_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (id, created_at) VALUES (?, ?)", (session_id, created_at))
    conn.commit()
    conn.close()
    
    return {
        "sessionId": session_id,
        "viewerUrl": f"/view/{session_id}", # Placeholder URL
        "websocketUrl": f"/ws/{session_id}",
        "createdAt": created_at,
    }

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch session details
    session_row = cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not session_row:
        raise HTTPException(status_code=404, detail="Session not found")

    # Fetch associated recordings
    recordings_rows = cursor.execute("SELECT id, started_at, ended_at FROM scg_records WHERE session_id = ?", (session_id,)).fetchall()
    conn.close()

    recordings = [dict(row) for row in recordings_rows]

    return {
        "sessionId": session_row["id"],
        "createdAt": session_row["created_at"],
        "recordings": recordings
    }


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "samples_batch":
                samples = message.get("payload", {}).get("samples", [])
                if not samples:
                    continue
                
                # Core processing step
                interpolated_signal, new_timestamps = preprocess_web_signal(samples)
                
                if interpolated_signal.size == 0:
                    continue

                # Prepare data for broadcasting
                interpolated_samples = [
                    {"t": int(t), "az": float(az)} 
                    for t, az in zip(new_timestamps, interpolated_signal)
                ]

                broadcast_message = {
                    "type": "interpolated_batch",
                    "payload": {
                        "interpolatedSamples": interpolated_samples
                    }
                }
                
                await manager.broadcast(json.dumps(broadcast_message), session_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        await manager.broadcast(json.dumps({
            "type": "status_update",
            "payload": {"status": "a_client_left", "sessionId": session_id}
        }), session_id)
    except Exception as e:
        print(f"Error in websocket: {e}")
        manager.disconnect(websocket, session_id)

# Include the router in the main app
app.include_router(api_router)

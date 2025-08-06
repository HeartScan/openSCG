import uuid
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.sockets import manager
from app.models.sample import WebSocketMessage

router = APIRouter()

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        # Validate session_id is a valid UUID
        session_uuid = uuid.UUID(session_id)
        
        while True:
            data = await websocket.receive_text()
            
            try:
                # Validate incoming message structure
                ws_message = WebSocketMessage.parse_raw(data)
                
                if ws_message.type == "samples_batch":
                    # Broadcast the raw message to other clients
                    await manager.broadcast(data, session_id, sender=websocket)
                    
                    # Buffer the data in memory
                    manager.buffer_data(session_id, ws_message.payload.samples)

            except ValidationError as e:
                # Handle invalid message format
                await websocket.send_text(json.dumps({"error": "Invalid message format", "details": e.errors()}))
            except Exception as e:
                # Handle other errors
                await websocket.send_text(json.dumps({"error": str(e)}))

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception:
        logging.error(f"Error in websocket connection for session {session_id}", exc_info=True)
        manager.disconnect(websocket, session_id)

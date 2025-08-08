from fastapi import WebSocket
from typing import Dict, List, Any

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.session_data: Dict[str, List[Any]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

        # Send historical data to the newly connected client
        if session_id in self.session_data:
            # Format the historical data into a single batch message
            historical_payload = {
                "type": "samples_batch",
                "payload": {"samples": [sample.dict() for sample in self.session_data[session_id]]}
            }
            await websocket.send_json(historical_payload)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)

    def buffer_data(self, session_id: str, data: Any):
        if session_id not in self.session_data:
            self.session_data[session_id] = []
        self.session_data[session_id].extend(data)

    def get_and_clear_data(self, session_id: str) -> List[Any]:
        return self.session_data.pop(session_id, [])

    async def broadcast(self, message: str, session_id: str, sender: WebSocket = None):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                if connection != sender:
                    await connection.send_text(message)

    async def broadcast_session_ended(self, session_id: str):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_json({"type": "session_ended"})

manager = ConnectionManager()

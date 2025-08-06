import requests
import websocket
import json
import time
from threading import Thread

# --- Configuration ---
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"
WS_URL_BASE = "ws://localhost:8000/ws"

# --- Mock Data ---
MOCK_SAMPLES = [
    {"t": time.time() * 1000, "ax": 0.1, "ay": 0.2, "az": 9.8},
    {"t": (time.time() + 0.01) * 1000, "ax": 0.11, "ay": 0.22, "az": 9.81},
]
MOCK_PAYLOAD = {
    "type": "samples_batch",
    "payload": {"samples": MOCK_SAMPLES}
}

def test_full_workflow():
    """
    Performs a full end-to-end test of the backend service.
    """
    print("--- Starting E2E Test ---")

    # 1. Create Session
    print("\n[Step 1] Creating session...")
    session_id = None
    for i in range(5): # Retry up to 5 times
        try:
            response = requests.post(f"{API_URL}/sessions")
            response.raise_for_status()
            session_data = response.json()
            session_id = session_data["sessionId"]
            print(f"  - Success: Created session {session_id}")
            break
        except requests.RequestException as e:
            print(f"  - Attempt {i+1}/5 failed. Retrying in 2 seconds...")
            time.sleep(2)
    
    if not session_id:
        print(f"  - Failure: Could not create session after multiple attempts.")
        return

    # 2. Setup WebSocket connections
    ws_url = f"{WS_URL_BASE}/{session_id}"
    patient_ws = websocket.WebSocket()
    received_message = None
    
    def on_message(ws, message):
        nonlocal received_message
        print(f"  - Viewer received message: {message}")
        received_message = json.loads(message)
        ws.close()

    print("\n[Step 2] Patient connects and sends data...")
    try:
        patient_ws.connect(ws_url)
        patient_ws.send(json.dumps(MOCK_PAYLOAD))
        print(f"  - Success: Patient sent payload: {json.dumps(MOCK_PAYLOAD)}")
    except Exception as e:
        print(f"  - Failure: Patient could not connect or send data. {e}")
        return

    # 3. Viewer connects and receives historical data
    print("\n[Step 3] Viewer connects and receives historical data...")
    received_message = None
    
    def on_message(ws, message):
        nonlocal received_message
        print(f"  - Viewer received message: {message}")
        received_message = json.loads(message)
        ws.close()

    try:
        viewer_ws_app = websocket.WebSocketApp(ws_url, on_message=on_message)
        viewer_thread = Thread(target=viewer_ws_app.run_forever)
        viewer_thread.daemon = True
        viewer_thread.start()
        viewer_thread.join(timeout=2) # Wait for viewer to connect and receive
    except Exception as e:
        print(f"  - Failure: Viewer connection failed. {e}")
        patient_ws.close()
        return

    # 4. Verify Real-time Broadcast
    print("\n[Step 4] Verifying real-time broadcast...")
    if received_message and received_message == MOCK_PAYLOAD:
        print("  - Success: Viewer received the correct data in real-time.")
    else:
        print(f"  - Failure: Viewer received incorrect data. Expected: {MOCK_PAYLOAD}, Got: {received_message}")
        patient_ws.close()
        return

    patient_ws.close()

    # 5. End Session
    print("\n[Step 5] Ending session...")
    try:
        response = requests.post(f"{API_URL}/sessions/{session_id}/end")
        response.raise_for_status()
        print(f"  - Success: Session {session_id} ended.")
    except requests.RequestException as e:
        print(f"  - Failure: Could not end session. {e}")
        return

    # 6. Verify Stored Data
    print("\n[Step 6] Verifying stored data...")
    try:
        response = requests.get(f"{API_URL}/sessions/{session_id}/data")
        response.raise_for_status()
        stored_data = response.json()
        
        # Basic check, a real test would compare floats with a tolerance
        if len(stored_data) == len(MOCK_SAMPLES):
             print("  - Success: Retrieved correct number of samples from database.")
        else:
             print(f"  - Failure: Incorrect number of samples. Expected {len(MOCK_SAMPLES)}, Got {len(stored_data)}")

    except requests.RequestException as e:
        print(f"  - Failure: Could not retrieve stored data. {e}")
        return

    print("\n--- E2E Test Finished Successfully ---")

if __name__ == "__main__":
    test_full_workflow()

# OpenSCG API Contract v0.1

This document defines the API for the OpenSCG server. It includes REST endpoints for session management and a WebSocket protocol for real-time data streaming.

## 1. Overview

- **REST API:** Used for stateless actions like creating and retrieving session information.
- **WebSocket API:** Used for stateful, real-time communication during a live measurement session.

## 2. REST API Endpoints

**Base URL:** `http://localhost:8000` (for local development)

---

### **Create Session**

Creates a new measurement session and returns the session details, including a unique ID and the WebSocket URL.

- **Endpoint:** `POST /api/v1/sessions`
- **Request Body:** (None)
- **Success Response (200 OK):**
  ```json
  {
    "sessionId": "a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
    "viewerUrl": "https://openscg.app/view/a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
    "websocketUrl": "ws://localhost:8000/ws/a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
    "createdAt": "2025-07-21T14:30:00.123Z"
  }
  ```

---

### **Get Session Data**

Retrieves the complete data for a completed session.

- **Endpoint:** `GET /api/v1/sessions/{sessionId}`
- **URL Parameters:**
  - `sessionId` (string, required): The UUID of the session.
- **Success Response (200 OK):**
  - Returns the [Full Session Object](../docs/openscg-format.md#2-full-session-object) as defined in the data format specification.
- **Error Response (404 Not Found):**
  ```json
  {
    "detail": "Session not found"
  }
  ```

---

## 3. WebSocket API

The WebSocket is the primary channel for real-time data transmission.

### **Connection URL**

- **Format:** `ws://<base_url>/ws/{sessionId}`
- **Example:** `ws://localhost:8000/ws/a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d`

### **Communication Flow**

1.  **Patient Client Connects:** The patient's device establishes a WebSocket connection to the URL provided by the `POST /api/v1/sessions` endpoint.
2.  **Physician Viewer(s) Connect:** Any client with the `sessionId` can connect to the same WebSocket endpoint to view the stream.
3.  **Patient Client Sends Data:** The patient client sends batches of accelerometer data to the server.
4.  **Server Broadcasts Data:** The server receives the raw data, interpolates it, and broadcasts the clean, interpolated data to all connected viewers for that session.

### **Message Formats**

#### **Client-to-Server: Sample Batch**

The patient client sends batches of raw samples.

- **Direction:** Patient -> Server
- **Payload:**
  ```json
  {
    "type": "samples_batch",
    "payload": {
      "samples": [
        { "t": 1721574600123, "ax": -0.012, "ay": 0.001, "az": 0.098 },
        { "t": 1721574600133, "ax": -0.011, "ay": 0.002, "az": 0.097 }
      ]
    }
  }
  ```

#### **Server-to-Viewer: Interpolated Data Broadcast**

The server broadcasts the processed, interpolated data to all viewers.

- **Direction:** Server -> Viewer(s)
- **Payload:**
  ```json
  {
    "type": "interpolated_batch",
    "payload": {
      "interpolatedSamples": [
        { "t": 1721574600120, "az": 0.0981 },
        { "t": 1721574600130, "az": 0.0975 }
      ]
    }
  }
  ```

#### **Server-to-All: Status Update**

The server can broadcast status updates to all participants in a session.

- **Direction:** Server -> All Clients
- **Payload:**
  ```json
  {
    "type": "status_update",
    "payload": {
      "status": "viewer_connected",
      "viewerCount": 1
    }
  }
  ```
  *Possible statuses: `patient_connected`, `viewer_connected`, `patient_disconnected`, `viewer_disconnected`, `session_ended`.*

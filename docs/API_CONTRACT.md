# OpenSCG API Contract v1.0

This document defines the API for the OpenSCG monolithic application (Next.js + Custom Server). It includes REST endpoints for session management and a WebSocket protocol for real-time data streaming.

## 1. Overview

-   **Base URL:** `/api` (served by Next.js API Routes)
-   **WebSocket URL:** `ws://<host>/` (served by the custom `server.js` on the same port)

## 2. REST API Endpoints

### **Device Authentication**

Before creating sessions, a client device must authenticate anonymously.

-   **Endpoint:** `POST /api/auth/device`
-   **Description:** Generates a secure, random device code and sets it as an `HttpOnly` cookie.
-   **Response (200 OK):**
    ```json
    { "deviceCode": "..." }
    ```

### **Create Session**

Creates a new measurement session.

-   **Endpoint:** `POST /api/sessions`
-   **Request Body:** (None)
-   **Success Response (200 OK):**
    ```json
    {
      "sessionId": "a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
      "viewerUrl": "/view/a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
      "createdAt": "2025-07-21T14:30:00.123Z"
    }
    ```

### **Get Session Data**

Retrieves the complete data for a *completed* session.

-   **Endpoint:** `GET /api/sessions/{sessionId}/data`
-   **Success Response (200 OK):**
    -   Returns the [Full Session Object](./openscg-format.md#2-full-session-object).
-   **Error Response (404 Not Found):**
    ```json
    { "error": "Session not found" }
    ```

### **Upload Session Data**

Uploads the full dataset from the client's local storage (IndexedDB) to the server for persistence.

-   **Endpoint:** `POST /api/sessions/{sessionId}/data`
-   **Request Body:** The [Full Session Object](./openscg-format.md#2-full-session-object).
-   **Success Response (200 OK):**
    ```json
    { "success": true }
    ```

## 3. WebSocket API

The WebSocket is used for real-time signaling.

-   **Library:** `socket.io` (client) / `socket.io` (server)
-   **Namespace:** `/`

### **Events**

#### **Join Session**
-   **Event:** `join-session`
-   **Payload:** `{ "sessionId": "..." }`
-   **Description:** Client (patient or viewer) joins the room for a specific session.

#### **Send Samples (Patient -> Server)**
-   **Event:** `new-samples`
-   **Payload:**
    ```json
    {
      "sessionId": "...",
      "samples": [
        [1743256991352, -5.2, 0.3, 8.4],
        [1743256991362, -5.1, 0.4, 8.3]
      ]
    }
    ```
    - Each sample is a tuple: `[timestamp_ms, ax, ay, az]`.

#### **Broadcast Samples (Server -> Viewer)**
-   **Event:** `scg-data`
-   **Payload:**
    ```json
    {
       "interpolatedSamples": [
         [1743256991352, -5.2, 0.3, 8.4],
         [1743256991362, -5.1, 0.4, 8.3]
       ]
    }
    ```

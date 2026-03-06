# ADR-002: Optimized Data Format & Late-Binding Sync

## Status
Accepted

## Context
Seismocardiography (SCG) data is high-frequency (100Hz+). Object-based JSON payloads `[{t: 1, ax: 0, ...}]` introduce significant bandwidth overhead (key name repetition) and increase JSON parsing latency on mobile devices. Additionally, real-time measurements are often performed in low-connectivity areas where immediate cloud upload might fail.

## Decision
We are transitioning to a **Tuple-Based Data Standard** and implementing **Late-Binding Cloud Synchronization**.

### 1. Optimized Data Format (V2)
All internal storage (IndexedDB) and transmission (WebSocket) will use the **Tuple Format**:
*   **Structure**: `[timestamp, ax, ay, az]`
*   **Benefits**: 
    *   **Bandwidth**: Reduces payload size by ~60% compared to objects.
    *   **Performance**: Faster serialization/deserialization for high-frequency streams.

### 2. Late-Binding Cloud Sync
Data persistence is decoupled from the live recording session to ensure reliability.
*   **Local-First**: Data is streamed in real-time but the *primary* persistent copy is saved to the patient's local storage (IndexedDB) immediately upon completion.
*   **Sync-on-Demand**: Cloud persistence (Redis) is guaranteed only when the patient initiates a "Share" action.
*   **Cache Rehydration**: The client automatically detects if a shared session is missing from the server (e.g., due to Redis TTL expiration) and re-uploads the data from local storage to restore visibility for the doctor.

## Consequences
### Positive
*   **Scalability**: Lower bandwidth per user allows for more concurrent sessions.
*   **Reliability**: Recordings are never lost due to server timeouts or network drops during capture.
*   **UX**: Smooth 60fps rendering even on low-end mobile devices due to reduced parsing load.

### Negative
*   **Complexity**: Client-side logic must handle format mapping when interacting with legacy API endpoints.
*   **First-Time Viewer Latency**: If data hasn't been synced yet, the doctor might experience a slight delay while the patient's client performs the initial upload.

# OpenSCG Architecture & Technical Decisions

**Last Updated:** 2025-03-01
**Status:** Active

## 1. High-Level Architecture

OpenSCG utilizes a **Monolithic Architecture** built on **Next.js 16 (App Router)** with a custom Node.js server. This design prioritizes simplicity, ease of deployment, and real-time performance for handling Seismocardiography (SCG) signal data.

### Core Components

1.  **Application Server (Monolith):**
    *   **Framework:** Next.js 16 (App Router) for Frontend UI and REST API.
    *   **Custom Server:** A custom `server.js` (using `http` and `next`) wraps the Next.js app to support a WebSocket server on the same port.
    *   **WebSocket Engine:** `socket.io` or `ws` is used for bidirectional real-time communication (telemetry).
    *   **Location:** `/openscg_app` directory.

2.  **Data Store:**
    *   **Technology:** **Redis**.
    *   **Role:** Acts as the *sole* backend database for both transient and persistent data.
    *   **Usage:**
        *   **Pub/Sub:** Broadcasts live signal data from patient -> server -> physician viewers.
        *   **Session Metadata:** Stores session state (`sessionId`, status, start/end times).
        *   **Persistence:** Stores completed session data as serialized JSON strings with a TTL (e.g., 30 days).

3.  **Client-Side Storage:**
    *   **Technology:** **IndexedDB** (via `localforage` or similar).
    *   **Role:** Provides "offline-first" reliability.
    *   **Usage:**
        *   Buffers raw accelerometer samples on the patient's device immediately.
        *   Ensures no data loss if the network drops during recording.
        *   Syncs data to the server upon reconnection or session completion.

## 2. Key Technical Decisions (ADRs)

### ADR-001: Next.js + Redis Monolith
*   **Decision:** Move from a split FastAPI/Next.js architecture to a single Next.js + Redis container.

### ADR-002: Optimized Data Format & Late-Binding Sync
*   **Decision:** Transition to a Tuple-Based Data Standard `[t, ax, ay, az]` and implement "Sync-on-Share" logic.

### ADR-003: Science Hub Content Integration via SSG
*   **Decision:** Integrate external scientific content using Static Site Generation (SSG).
*   **Rationale:** Maximizes SEO and performance while maintaining a clear separation between technical UI development and scientific content creation.
>>>>+++ REPLACE

*   **Rationale:**
    *   **Simplicity:** Deployment requires only one application container and one Redis instance.
    *   **Performance:** Redis offers sub-millisecond latency crucial for real-time signal streaming.
    *   **Privacy:** Redis TTL features allow for automatic data expiration (Privacy by Design).
    *   **Deployment:** Eliminates the complexity of coordinating separate frontend and backend deployments across different providers.

## 3. Deployment Strategy

The application is containerized using Docker and is designed to run on any platform that supports long-running containers (e.g., Fly.io, Google Cloud Run, DigitalOcean App Platform, or a VPS).

*   **Docker:** The `openscg_app/Dockerfile` builds a production-ready image.
*   **Orchestration:** `docker-compose.yml` is provided for local development and simple single-host production setups (orchestrating `app` + `redis`).
*   **Limitations:** This architecture *cannot* be deployed to standard Serverless Function platforms (like standard Vercel hosting) because of the requirement for a long-running custom WebSocket server. It requires a container runtime.

## 4. Data Flow

1.  **Session Creation:**
    *   Patient opens app -> Generates `sessionId` and `deviceCode` -> Saved to Redis.
2.  **Live Streaming:**
    *   Patient connects WebSocket -> Sends batch of accelerometer samples.
    *   Server receives batch -> Publishes to Redis Channel `session:{id}:stream`.
    *   Subscribed Viewers receive update -> Render on chart.
3.  **Persistence:**
    *   Client accumulates samples in `IndexedDB`.
    *   On "Stop", client uploads full dataset to `POST /api/sessions/{id}/data`.
    *   Server saves full dataset to Redis Key `session:{id}:data` with TTL.

## 5. Security Model

*   **Anonymous Access:** No user accounts required.
*   **Device Code:** A secure, random token stored in an HttpOnly cookie authenticates the patient's device to the session it created.
*   **Shareable Links:** Access to view a session is granted by possession of the unique `sessionId` URL.

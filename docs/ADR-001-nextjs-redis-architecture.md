# ADR-001: Next.js + Redis Monolith Architecture

## Status
Accepted

## Context
The previous architecture used a separated `client/` (Next.js) and `server/` (FastAPI) structure with PostgreSQL for persistence. This was overly complex for the core requirements:
1. Real-time SCG streaming (low latency).
2. Simple session sharing (via URL).
3. "One-click" OSS deployment.
4. Privacy compliance (ephemeral data).

## Decision
We are migrating to a **Monolithic Architecture** using **Next.js 16** with a custom **Node.js Server** and **Redis** as the sole data store.

### Key Components:
1.  **Frontend & API**: Next.js 16 (App Router) handles UI rendering and API routes.
2.  **Streaming**: A custom `server.js` wraps Next.js and runs a WebSocket server (`socket.io` or `ws`) on the same port.
3.  **Data Store (Redis)**:
    *   **Pub/Sub**: Used for real-time broadcasting of SCG data from patient to doctor.
    *   **Persistence**: Completed session data is serialized to JSON strings and stored in Redis with a TTL (e.g., 30 days).
    *   **Auth**: No user accounts. Authentication is handled via a randomly generated "Device Code" stored in a secure HttpOnly cookie. Ownership of sessions is tracked by storing session IDs in a Redis Set associated with the Device Code.
4. **Client-Side Storage (IndexedDB)**:
    *   **Offline-First**: Raw signal data is persisted locally in the client's browser (IndexedDB) via `localforage` or similar.
    *   **Cache Rehydration**: If Redis TTL expires but the user revisits the session, the app can re-upload the data from local storage to restore the shared view.
    *   **Resilience**: Prevents data loss during network interruptions while recording.

## Consequences
### Positive
*   **Simplified Deployment**: Only one container needed for the app, plus one for Redis. `docker-compose up` works instantly.
*   **Privacy by Design**: Data automatically expires via Redis TTL. No need for complex deletion policies.
*   **Performance**: Redis provides sub-millisecond latency for both streaming and session retrieval.
*   **Code Reuse**: Shared TypeScript types between frontend and backend logic.

### Negative
*   **No Long-Term Archive**: Data is lost after TTL expires (unless we add an optional S3 export feature later).
*   **Vercel Limitations**: Custom WebSocket servers cannot be deployed to standard Vercel serverless functions; they require a containerized environment (e.g., Google Cloud Run, Docker, VPS).

## Implementation Plan
1.  Initialize `openscg_app/` as a new Next.js project.
2.  Port advanced charting components from `labeling_reference_code/`.
3.  Implement `server.js` with WebSocket logic.
4.  Configure Redis connection using `ioredis`.
5.  Update `docker-compose.yml` to orchestrate `openscg_app` and `redis`.

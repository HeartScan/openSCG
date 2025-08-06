# Backend Refactor and Public API Strategy

**Date:** 2025-08-06

## 1. Objective

To refactor the existing Python backend into a robust, scalable, and secure public API service. The service will be designed to be efficient, fast, and light, allowing it to be offered for free to the open-source community.

## 2. Core Architectural Principles

- **Lean & Performant:** The backend's primary responsibility is high-speed, reliable data transport. Computationally expensive tasks (like signal interpolation) will be offloaded to client applications.
- **API First:** The API will be rigorously defined by an OpenAPI v3 contract. This contract is the single source of truth.
- **Stateless & Scalable:** The service will be designed to run as a containerized application on a serverless platform like Google Cloud Run, enabling automatic scaling.
- **Data Safety:** The system will be designed to prevent data loss, even in the event of a server crash during a live session.

## 3. Key Architectural Decisions

### 3.1. Data Flow: Raw Data Pipeline

1.  **Ingestion:** The server ingests **raw** accelerometer data via a WebSocket connection.
2.  **Live Broadcast:** The server immediately broadcasts the incoming raw data to all connected viewers for that session. The backend acts as a simple, low-latency message broker.
3.  **Asynchronous Persistence:** In parallel to the broadcast, the server places the incoming data batch into a background queue. A background worker processes this queue, writing the data to the PostgreSQL database in batches. This ensures the real-time path is not blocked by database I/O.
4.  **Session Finalization:** A dedicated REST endpoint (`POST /sessions/{id}/end`) is used to formally mark a session as complete.
5.  **On-Demand Retrieval:** A REST endpoint (`GET /sessions/{id}/data`) provides the full, saved raw data for any completed session.

### 3.2. Security Model

- **Anonymous Access:** The API will be public and anonymous. No user accounts or complex authentication will be required to create a session.
- **Access via Uniqueness:** Access to session data (both live and stored) will be controlled by a public but unguessable `sessionId` (UUID v4).
- **Rate Limiting:** The API will be protected by rate limiting to prevent abuse and ensure service stability for all users.

### 3.3. Technology Stack

- **Framework:** FastAPI
- **Data Validation:** Pydantic
- **Database:** PostgreSQL
- **Deployment:** Docker container on Google Cloud Run
- **Database Hosting:** Google Cloud SQL

## 4. API Contract

The API will be formally defined in `docs/API_CONTRACT.yml` using the OpenAPI 3.0 specification.

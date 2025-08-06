# Backend Improvement Plan & To-Do List

This document outlines the actionable steps required to refactor the backend according to the `BACKEND_REFACTOR_STRATEGY.md`.

## Phase 1: Project Restructuring and Setup

-   [ ] **Task 1.1: Reorganize Directory Structure**
    -   Create a new `server/app` directory.
    -   Create subdirectories: `app/api`, `app/core`, `app/db`, `app/models`.
    -   Move existing logic into the appropriate new modules.

-   [ ] **Task 1.2: Implement Pydantic Models**
    -   Create `app/models/session.py` and `app/models/sample.py`.
    -   Define Pydantic classes for `Session`, `Sample`, and `Error` that match the OpenAPI contract.

-   [ ] **Task 1.3: Centralize Configuration**
    -   Create an `app/core/config.py` file.
    -   Use Pydantic's `BaseSettings` to load configuration from environment variables (e.g., `DATABASE_URL`).

-   [ ] **Task 1.4: Update Database Logic**
    -   Create a new `scg_raw_data` table schema.
    -   Refactor `database.py` to provide a dependency-injectable database session.

## Phase 2: API Endpoint Implementation

-   [ ] **Task 2.1: Refactor `POST /api/v1/sessions`**
    -   Update the endpoint to use the new Pydantic models for the response.
    -   Ensure it returns all fields as specified in the OpenAPI contract.

-   [ ] **Task 2.2: Implement `POST /api/v1/sessions/{id}/end`**
    -   Create the new endpoint to update the session status to `ended` in the database.

-   [ ] **Task 2.3: Implement `GET /api/v1/sessions/{id}/data`**
    -   Create the new endpoint to query and return all raw data associated with a session from the `scg_raw_data` table.

## Phase 3: WebSocket Refactoring

-   [ ] **Task 3.1: Simplify WebSocket Logic**
    -   Remove the `preprocess_web_signal` call from the WebSocket handler.
    -   The handler should only perform two actions:
        1.  Broadcast the incoming raw message to other clients.
        2.  Add the data persistence task to the background queue.

-   [ ] **Task 3.2: Implement Asynchronous DB Writes**
    -   Create a background task function that takes a batch of samples and writes them to the `scg_raw_data` table.
    -   Use FastAPI's `BackgroundTasks` to trigger this function from the WebSocket handler.

## Phase 4: Hardening and Production Readiness

-   [ ] **Task 4.1: Implement Rate Limiting**
    -   Add a dependency like `slowapi` to the project.
    -   Apply a default rate limit to all API endpoints.

-   [ ] **Task 4.2: Configure Structured Logging**
    -   Remove all `print()` statements.
    -   Configure the Python `logging` module to output JSON-formatted logs.

-   [ ] **Task 4.3: Create Basic Test Suite**
    -   Set up `pytest`.
    -   Write initial unit tests for the API endpoints.

## Phase 5: Deployment

-   [ ] **Task 5.1: Create `cloudbuild.yaml`**
    -   Write a Google Cloud Build configuration file to automate the process of building the Docker image and deploying it to Cloud Run.

-   [ ] **Task 5.2: Update Documentation**
    -   Update `README.md` and `DEV_SETUP.md` to reflect the new architecture, setup, and deployment process.

# OpenSCG Development Setup

This guide provides step-by-step instructions for setting up a local development environment for the OpenSCG project.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git:** For version control.
- **Docker:** For containerizing the application services.
- **Docker Compose:** For orchestrating the multi-container setup. (Usually included with Docker Desktop).
- **Node.js:** (v18 or later) For frontend development.
- **Python:** (v3.9 or later) For backend development.

## 2. Cloning the Repository

First, clone the OpenSCG repository to your local machine:

```sh
git clone https://github.com/HeartScan/openSCG.git
cd openSCG
```

## 3. Project Structure

The project is organized into a monorepo structure:

- **`/client`:** The patient-facing Next.js web application.
- **`/server`:** The FastAPI backend server for real-time ingestion and streaming.
- **`/docs`:** Project documentation.
- **`docker-compose.yml`:** The configuration file for running the services together.

*(Note: These directories will be created in the next phase of development).*

## 4. Environment Variables

Each service may require its own environment variables. Create a `.env` file in the root of the `/client` and `/server` directories as needed.

Example for `/server/.env`:
```
DATABASE_URL=postgresql://user:password@db:5432/openscg
```

## 5. Running the Application with Docker

The easiest way to get all services running is by using Docker Compose.

```sh
# From the root of the project directory
docker-compose up --build
```

This command will:
1.  Build the Docker images for the `client` and `server`.
2.  Start containers for each service, including a PostgreSQL database.
3.  Make the services available on your local machine.

- **Patient Client:** `http://localhost:3000`
- **Backend Server:** `http://localhost:8000`

## 6. Manual Setup (Without Docker)

For more granular control or for developers who prefer not to use Docker, each service can be run manually.

### Backend Server

```sh
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Client

```sh
cd client
npm install
npm run dev
```

## 7. Contributing

Once your environment is set up, you can start making changes. Please refer to the [CONTRIBUTING.md](../CONTRIBUTING.md) guide for details on our development process and how to submit your contributions.

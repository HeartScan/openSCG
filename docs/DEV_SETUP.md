# OpenSCG Development Setup

This guide provides step-by-step instructions for setting up a local development environment for the OpenSCG project.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git:** For version control.
- **Docker:** For containerizing the application services.
- **Docker Compose:** For orchestrating the multi-container setup. (Usually included with Docker Desktop).
- **Node.js:** (v18 or later) For frontend development.
- **Python:** (v3.9 or later) For backend development.
- **ngrok:** For exposing the local development environment to the internet.

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

## 5. Running the Application with Docker (Recommended)

The easiest and most reliable way to get all services running for development (especially for mobile testing) is to use the provided automation script.

### One-Time Setup

1.  **Install ngrok:**
    ```sh
    npm install -g ngrok
    ```
2.  **Authenticate ngrok:**
    *   Get your authtoken from [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
    *   Run the following command:
        ```sh
        ngrok config add-authtoken <YOUR_AUTHTOKEN>
        ```

### Running the Development Environment

From the root of the project directory, run the following command:

```sh
./start-dev.sh
```

This script will:
1.  Start all the Docker containers.
2.  Create secure public URLs for the frontend and backend using ngrok.
3.  Automatically configure the frontend to connect to the backend.
4.  Print the public frontend URL to the console.

You can then open this URL on your mobile device to test the application with full functionality.

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

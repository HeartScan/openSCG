# OpenSCG Development Setup

This guide provides instructions for setting up a local development environment for the OpenSCG project.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Git:** For version control.
- **Docker:** For running the Redis database and containerized application.
- **Docker Compose:** For orchestrating the multi-container setup. (Usually included with Docker Desktop).
- **Node.js:** (v20 or later) For local development without Docker.
- **pnpm:** (Recommended) or `npm` / `yarn`.

## 2. Cloning the Repository

First, clone the OpenSCG repository to your local machine:

```sh
git clone https://github.com/HeartScan/openSCG.git
cd openSCG
```

## 3. Project Structure

The project has been consolidated into a monolithic structure:

- **`openscg_app/`**: The main Next.js application (Frontend + Backend API + WebSocket Server).
- **`docs/`**: Project documentation.
- **`docker-compose.yml`**: configuration for running the `app` and `redis` services.

## 4. Environment Variables

The `openscg_app` service requires environment variables. Create a `.env.local` file in `openscg_app/` if running locally without Docker, or rely on `docker-compose.yml` defaults.

Key variables:
- `REDIS_URL`: Connection string for Redis (default: `redis://redis:6379` in Docker, `redis://localhost:6379` locally).
- `NO_REDIS`: Set to `true` to run the application without a Redis connection (In-Memory mode).

## 5. Running with Docker Compose (Recommended)

This is the simplest way to get the full stack running.

```sh
docker-compose up --build
```

- The app will be available at `http://localhost:3000`.
- By default, it runs in **In-Memory Mode** (No Redis) for simplified local development.
- To enable Redis, uncomment the `redis` service in `docker-compose.yml` and remove `NO_REDIS=true`.

## 6. Manual Setup (Local Node.js Dev)

If you prefer to run the Next.js app directly on your host machine (e.g., for faster HMR):

1.  **Start Redis:**
    You can use Docker just for Redis:
    ```sh
    docker run -p 6379:6379 redis:alpine
    ```

2.  **Install Dependencies:**
    ```sh
    cd openscg_app
    pnpm install
    ```

3.  **Run the Development Server:**
    The recommended way is to use the PowerShell helper script in the root:
    ```powershell
    .\dev.ps1
    ```

    Alternatively, run manually from the `openscg_app` directory:
    ```sh
    pnpm run dev
    ```
    
    *Note: This starts the custom server (`server.js`) which handles both Next.js pages and WebSockets.*

4.  **Open Browser:**
    Navigate to `http://localhost:3000`.

## 7. Mobile Testing (Local Network)

To test on a mobile device (essential for accelerometer access):

1.  Ensure your computer and mobile device are on the same Wi-Fi network.
2.  Find your computer's local IP address (e.g., `192.168.1.50`).
3.  On your mobile device, navigate to `http://192.168.1.50:3000`.

**CRITICAL NOTE ON SENSORS:**
Modern mobile browsers (iOS Safari, Android Chrome) **require a secure HTTPS context** to access the accelerometer.
- For local testing, you can use a tunneling service like `ngrok`.
- For a production-like test, the easiest way is to deploy to **Google Cloud Run**, which provides HTTPS out of the box. See [docs/DEPLOY_GCP.md](DEPLOY_GCP.md).

## 8. Deployment

For detailed instructions on deploying the application to Google Cloud Platform, see [docs/DEPLOY_GCP.md](DEPLOY_GCP.md).

## 9. Contributing

Please refer to `CONTRIBUTING.md` for details on our development process and pull request workflow.

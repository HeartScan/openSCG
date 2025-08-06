# Architecture Decision Record: Hosting and Inference

**Date:** 2025-07-21

**Status:** Decided

## Context

We need to select the optimal hosting and deployment strategy for the OpenSCG platform. The platform consists of two main components:
1.  **Frontend (`/client`):** A Next.js application serving the patient and physician UI.
2.  **Backend (`/server`):** A real-time ingestion and streaming server (FastAPI) that must handle persistent WebSocket connections.

The choice must balance performance, cost, scalability, and ease of deployment for an open-source community.

## The Decision: A Hybrid, Best-of-Breed Approach

We will adopt a hybrid deployment strategy, using the best platform for each component:

1.  **Frontend (`/client`):** Deploy to **Vercel**.
2.  **Backend (`/server`):** Deploy as a **Docker container to Fly.io or Render**.

## Rationale

### 1. Frontend on Vercel

Vercel is the creator of Next.js and provides a platform that is purpose-built for it.

-   **Unmatched Performance:** Global CDN, automatic image optimization, and serverless functions for API routes give the best possible user experience.
-   **Seamless CI/CD:** Deployment is as simple as `git push`. Vercel automatically builds, deploys, and provides preview URLs for every pull request.
-   **Cost-Effective:** The free tier is generous and more than sufficient for the initial stages of the project.

### 2. Backend on a Container Platform (Fly.io / Render)

The backend's primary requirement is to maintain **long-running, stateful WebSocket connections**. This makes it fundamentally incompatible with serverless function platforms like Vercel's backend offering, which have short execution time limits.

We need a platform that runs persistent processes. A container-based approach is ideal.

-   **Why Containers?**
    -   **Portability:** A Docker container runs the same way on a developer's laptop as it does in production. This is essential for an open-source project.
    -   **Scalability:** Platforms like Fly.io and Render can scale containers based on demand.
    -   **Control:** We have full control over the environment inside the container.

-   **Why Fly.io or Render?**
    -   **Developer Experience:** These platforms are designed for simplicity. You can often deploy directly from a `Dockerfile` in your repository with minimal configuration.
    -   **Cost-Effectiveness:** They have excellent free tiers and a "scale-to-zero" or "scale-to-one" model, meaning you are not paying for significant idle capacity.
    -   **Global Distribution:** Fly.io, in particular, makes it easy to deploy your container in multiple regions close to your users, which is excellent for reducing latency in a real-time application.

## Rejected Alternatives

-   **Azure VM / GCP Compute Engine:** Rejected due to high operational overhead. We would be responsible for managing the OS, security, and patching, which is overkill for this stage.
-   **Azure App Service / GCP App Engine:** Viable, but more complex and potentially more expensive than container-specific platforms like Fly.io or Render. They are better suited for larger, more complex enterprise applications.
-   **Backend on Vercel:** Rejected because its serverless function architecture cannot support the persistent WebSocket connections required for our real-time backend.

## Conclusion

This hybrid strategy allows us to use the absolute best tool for each job without compromise. Vercel will provide a world-class experience for our frontend users, while a container on Fly.io or Render will give us the robust, scalable, and cost-effective real-time backend we need.

# ADR-003: Science Hub Content Integration via Static Site Generation (SSG)

**Date:** 2026-03-05
**Status:** Proposed
**Deciders:** HeartScan Team

## Context and Problem Statement

The openSCG.org platform needs to host a "Science Hub" – a comprehensive knowledge base of Seismocardiography (SCG) research. This content is developed and maintained externally as a structured dataset (JSON, Markdown, and media files). We need a robust, performant, and SEO-friendly way to integrate this external content into the Next.js-based openSCG application.

## Decision Drivers

*   **SEO Excellence:** Scientific content must be highly discoverable by search engines and AI research agents.
*   **Performance:** Pages should load near-instantly.
*   **Ease of Integration:** The process of updating content should be as simple as dropping new files into a specific directory.
*   **Decoupling:** Technical development of the UI should be decoupled from the scientific content creation process.

## Considered Options

1.  **Dynamic Rendering (SSR):** Fetching data from a CMS or API on every request.
2.  **Client-Side Fetching:** Loading JSON/Markdown in the browser.
3.  **Static Site Generation (SSG):** Pre-rendering all science pages during the build process.

## Decision Outcome

Chosen option: **Option 3: Static Site Generation (SSG)**.

This approach perfectly aligns with the requirement for high performance and SEO. Since the scientific content changes infrequently compared to real-time signal data, the build-time cost is negligible compared to the runtime benefits.

### Implementation Details: The Content Contract

To ensure smooth integration, a strict "Content Contract" is established. All external content must be provided in the following structure within the `openscg_app/public/science-hub/` directory:

1.  **Data Registry (`master_source_v2.json`):**
    *   The single source of truth for the research database.
    *   Contains metadata for all studies, clusters, and relationships.
2.  **Detailed Content (`studies/*.md`):**
    *   Individual Markdown files named by study ID (e.g., `S001.md`).
    *   Contains the full textual analysis and critical appraisal of each study.
3.  **Media Assets (`assets/`):**
    *   Images, graphs, and diagrams referenced in the studies.
4.  **Semantic Graph (`semantic_graph.gexf`):**
    *   Used for visualizing study relationships (optional).

### Technical Integration in Next.js

*   **Path:** Pages will be served under `/science/...` (e.g., `/science/studies/S001`).
*   **Data Fetching:** Next.js `getStaticProps` (or equivalent in App Router) will read directly from the `public/science-hub/` directory during the build process.
*   **Rendering:** Use `react-markdown` or similar to render the Markdown content into the themed components of the app.

## Pros and Cons of the Chosen Option

### Pros

*   **Blazing Fast:** Content is served as static HTML/JSON.
*   **SEO Optimized:** Full content is visible to crawlers.
*   **Zero Database Load:** Science pages don't hit Redis or any other DB at runtime.
*   **Simple Versioning:** Content changes can be tracked via Git along with the code.

### Cons

*   **Build Time:** Adding hundreds of pages will slightly increase the CI/CD build duration.
*   **Manual Trigger:** Updates to the science hub require a new deployment (or a build trigger).

## Consequences

*   The frontend team must implement the `/science` route and its components according to this contract.
*   The content provider must ensure that the files in `public/science-hub/` adhere to the agreed schema.

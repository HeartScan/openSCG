# OpenSCG — Open-Source Cardiac Graph Infrastructure

Turn any smartphone into a live seismocardiography (SCG) sensor that doctors can watch in real time during a telemedicine call.

---

## ⚡ TL;DR

**Problem:** Telemedicine still lacks objective cardiac data – doctors rely on words, not signals.

**Solution:** OpenSCG streams raw accelerometer data from a patient’s phone and renders heartbeat waveforms for the clinician in seconds – no app install, no extra hardware.

**Scope:** Patient PWA, ingestion API, live viewer, JSON spec, Docker deploy, MIT/Apache OSS.

**Status:** Fully functional monolithic application based on Next.js and Redis.

---

## 📑 Table of Contents

1. [Why It Matters](#1-why-it-matters)
2. [User Workflows](#2-user-workflows)
3. [System Overview](#3-system-overview)
4. [Architecture Snapshot](#4-architecture-snapshot)
5. [Feature Roadmap](#5-feature-roadmap)
6. [Tech Stack](#6-tech-stack)
7. [Getting Started (Development)](#7-getting-started-development)
8. [Data Format – OpenSCG V2 (Optimized Tuples)](#8-data-format--openscg-v2-optimized-tuples)
9. [Licensing & Commercial Use](#9-licensing--commercial-use)
10. [Contributing](#10-contributing)
11. [Screenshots](#%EF%B8%8F-screenshots)
12. [Testing / CI](#-testing--ci)

---

## 1. Why It Matters
- **Zero hardware barrier.** SCG uses the phone you already own.
- **True vital sign.** Waveform shows mechanical heart motion – something video chat cannot.
- **Fills the telehealth gap.** Adds objective data before expensive RPM devices arrive.
- **Research booster.** Includes a **Science Hub** with curated SCG research.

---

## 2. User Workflows

**Patient**
- Opens `https://openscg.org/` on phone (PWA).
- Grants accelerometer permissions (requires HTTPS).
- Places device on chest (mid-sternum or apex).
- Taps Start – sensor data streams instantly.

**Clinician / Expert**
- Opens the shared session link.
- Watches real-time waveform.
- Reviews historical measurements from the session.

---

## 3. System Overview

- **Monolithic App (Next.js):** A single application handling the Frontend, API Routes, and a Custom WebSocket server.
- **Real-time Engine:** Uses `Socket.io` for low-latency data streaming from patient to expert.
- **Data Persistence:** Uses **Redis** for high-speed buffering and session state management.
- **Science Hub:** A dedicated section of the site containing static research data, managed via an SSG pipeline.

---

## 4. Architecture Snapshot

```
+----------------+      +---------------------------+      +----------------+
|                |      |    Next.js Monolith       |      |                |
|  Patient Phone |----->| (API Routes + WebSockets) |----->| Expert Browser |
| (PWA)          |      |                           |      | (Signal View)  |
|                |      +------------+--------------+      |                |
+----------------+                   |                     +----------------+
                                     |
                         +-----------v-----------+
                         |        Redis          |
                         | (Live Buffer + State) |
                         +-----------------------+
```

### Key API Endpoints

- `POST /api/auth/device`: Authenticates the device.
- `POST /api/sessions`: Creates a new measurement session.
- `GET /api/sessions/{id}/data`: Retrieves raw data for a session.
- `POST /api/sessions/{id}/data`: Uploads local data to the cloud.

---

## 5. Feature Roadmap

| Phase         | Status    | Deliverables                                                      |
|-------------- |---------- |-------------------------------------------------------------------|
| Phase 1: MVP  | **Done**  | Next.js Monolith, WebSocket streaming, Signal Visualization       |
| Phase 2: Hub  | **Done**  | Science Hub integration, Historical Review, Optimized V2 Format   |
| Phase 3: ML   | Planned   | AO/AC detection module, advanced signal analysis                  |

---

## 6. Tech Stack

**Frontend/Backend**
- **Next.js 15** (App Router)
- **Tailwind CSS** & **Shadcn/UI**
- **Socket.io** for WebSockets
- **Lucide React** for iconography

**Storage & Infrastructure**
- **Redis** for session buffering
- **Google Cloud Run** for hosting
- **Docker** for containerization

---

## 7. Getting Started (Development)

For a complete guide on setting up a local development environment, including instructions for mobile testing, please see the [**Development Setup Guide**](./docs/DEV_SETUP.md).

Quick start:
```powershell
.\dev.ps1
```

---

## 8. Data Format – OpenSCG V2 (Optimized Tuples)

To reduce bandwidth by 60%, OpenSCG uses an optimized tuple format for signal data:

```json
[
  [1743256991352, -5.2, 0.3, 8.4],
  [1743256991362, -5.1, 0.4, 8.3]
]
```

Each tuple represents: `[timestamp_ms, acc_x, acc_y, acc_z]`.

See the full specification in `docs/openscg-format.md`.

---

## 9. Licensing & Commercial Use

- **Code and protocol:** Apache 2.0 / MIT – free for OSS and non-commercial use.
- **Science Hub content:** Open Access (CC-BY).

---

## 10. Contributing

See `CONTRIBUTING.md` for details.

---

## 🧪 Testing

- **Unit/Integration:** `vitest`
- **E2E:** `playwright`

Run tests:
```powershell
cd openscg_app
pnpm test
```

---

Maintained by the HeartScan team — Warsaw, Poland

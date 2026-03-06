# OpenSCG UX Architecture & Guidelines

## 1. Product Vision
OpenSCG (SeismoCloud) is a real-time, privacy-first platform for acquiring, streaming, and analyzing Seismocardiography (SCG) signals. It bridges the gap between patient data capture (via smartphone accelerometers) and clinical analysis (via advanced web-based visualization), without requiring user accounts or permanent installation.

## 2. User Personas & Journeys

### A. The Patient (Data Source)
*   **Context**: Using a mobile device (iOS/Android) via browser. Often non-technical. May have poor internet connection.
*   **Goal**: Quickly record a heart signal session and share it with a doctor.
*   **Key Journey**:
    1.  Opens the app (home/record page).
    2.  **Session Creation**: Automatically generates a unique Session ID and "Device Code".
    3.  **Real-Time Sharing**: Displays a **Share Link** immediately for real-time telemetry.
    4.  **Measurement**: Starts measurement -> Countdown -> Live Capture (Standard 60s or Monitoring Mode).
        *   Patient can stop the recording manually at any time.
        *   Doctor watches signal in real-time via the shared link.
    5.  **Review & Verify**: Upon completion, the patient remains in "Review Mode" where the full waveform is displayed.
    6.  **Historical Sharing**: The patient can access "Recent Recordings" from the home page.
        *   Clicking an item opens a **Measurement Detail Modal**.
        *   The app verifies the data exists on the server (re-hydrating from local storage if necessary) before allowing sharing.
        *   Uses native mobile sharing (`navigator.share`) for a seamless experience.

### B. The Doctor / Researcher (Analyst)
*   **Context**: Using a desktop or tablet with a large screen.
*   **Goal**: Monitor signal in real-time (telemetry) or review historical recording with high precision.
*   **Key Journey**:
    1.  Receives link (`/view/[sessionId]`) from patient.
    2.  **Waiting State**: If the doctor joins early, they see a "Waiting for Patient" status with active connection indicators.
    3.  **Live View**: Signal flows in real-time using high-frequency rendering (60fps).
    4.  **Analysis**: Uses zooming, panning, and **Split View** (ECG-strip style) to inspect morphology.

## 3. Interface Architecture

### Patient Interface: `HomePage`
*   **Design Philosophy**: "Action vs. Archive".
*   **Primary Action**: Large "Start Session" buttons (Standard or Monitoring).
*   **Secondary Action**: "Recent Recordings" list for review and sharing.
*   **Feedback**: Native-feeling modals and toast notifications for synchronization status.

### Review Module: `MeasurementDetailModal`
*   **Components**: 
    *   `SignalViewer` for high-fidelity review.
    *   Sync-aware Share button with "Syncing..." status.
    *   Delete action.

## 4. Technical UX Principles

### Performance: High-Frequency Rendering
*   Bypasses React render cycle for the data stream using mutable refs and `requestAnimationFrame`.
*   Uses **V2 Optimized Tuples** `[t, ax, ay, az]` for 60% reduction in transmission overhead.

### Resilience: Late-Binding Cloud Sync
*   Measurements are saved locally first (IndexedDB).
*   Upload to cloud is deferred until explicit sharing or background sync, ensuring the app works flawlessly in low-connectivity environments.
*   **Cache Rehydration**: Automatic detection of expired cloud cache with transparent re-upload from client storage.

## 5. Privacy & Data Flow
*   **Ephemeral by Design**: Data in cloud storage (Redis) has a TTL (30 days).
*   **Patient-Controlled**: Sharing is explicit. Local data remains in the patient's device until deleted.

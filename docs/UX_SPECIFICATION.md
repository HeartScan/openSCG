# OpenSCG.org UX Specification

**Version:** 1.0.0
**Date:** 2026-03-05
**Status:** Active

## 1. Project Naming & Identity
- **Canonical Name:** `OpenSCG.org`. Use this name consistently across all metadata, headers, footers, and textual content.
- **Identity:** A professional, clinical-grade open-source ecosystem for Seismocardiography. Avoid "SeismoCloud" or other transitional project names.
- **Brand Aesthetic:** High-fidelity, authoritative, and clinical. Use deep slate tones with the primary blue (`#0066FF`) for high contrast and trust.

## 2. Global Navigation
- **Public vs. Private:**
    - **Science Hub:** Publicly accessible, SEO-optimized academic resource.
    - **Expert View:** A **strictly private** feature. Do not include "Expert View" links in public headers or footers. Access is exclusively via clinician-shared URLs/codes.
- **Header Structure (Science Hub):**
    - High-quality logo with pulse icon.
    - Sticky positioning with backdrop-blur.
    - Responsive mobile menu for cluster navigation.
    - Status indicator (e.g., "Stable v2.0.0") instead of private navigation links.

## 3. Desktop Experience Strategy: Mobile Sensor Authority
- **Core Principle:** Seismocardiography requires high-fidelity MEMS sensors (accelerometers) typically found only in smartphones. Desktop computers lack the necessary hardware.
- **QR Bridge logic:**
    - When a user on a desktop attempts to initiate a "Clinical Capture," do **not** show non-functional buttons.
    - Display a professional **Desktop-to-Mobile Bridge modal**.
    - Explain the technical requirement for mobile sensors.
    - Provide a high-fidelity QR code to instantly open the app on the user's mobile device.
- **Main Action (Desktop):**
    - The primary desktop call-to-action is **"Try on Example Data."** 
    - This allows immediate exploration of the clinical dashboard without requiring a sensor.
    - The design must be high-impact to build immediate trust.

## 4. Mobile Experience Strategy: Action-First
- **De-cluttering:**
    - Collapsible "Clinical Capture Controls" section to reduce cognitive load on the home page.
    - Primary focus on the "Start Session" and "Share Stream" actions once the section is expanded.
- **Interaction:** Fast, responsive feedback for sensor calibration and countdowns.

## 5. Research Hub Architecture (Evidence Clusters)
- **Bibliography Organization:**
    - Must be strictly grouped into all **5 SEO-optimized clusters**:
        1. `comparison`: Gold-Standard (Echo/MRI) validation.
        2. `cad`: Coronary Artery Disease detection.
        3. `hf`: Heart Failure and PCWP estimation.
        4. `tech`: Technical sensor and jitter analysis.
        5. `ml`: Advanced signal processing and U-Net architectures.
- **Content Integrity:**
    - Full frontmatter parsing (using `gray-matter`) to ensure clean rendering.
    - No raw metadata (YAML) visible in the article bodies.

## 6. Community & Authority
- **Collaboration Section:**
    - Integrated organically at the bottom of the home page.
    - Prominent link to the GitHub repository.
    - Clear statement of open-source mission to build institutional trust.

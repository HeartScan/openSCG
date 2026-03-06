# UX Specification: Science Hub Image Illustration & Floating Carousel

## Overview
This document specifies the user experience and interface requirements for the new visual elements in the Science Hub: the **Random Study Illustration** and the **Floating Research Carousel**.

## 1. Random Study Illustration
A dynamic visual component on the main `/science` page that provides immediate visual context to the research database.

### Visual Design
- **Location:** Prominent position on the Science Hub index page.
- **Content:** Displays one random image from the research papers.
- **Metadata:** Show the Study ID (e.g., S002), short caption, and Year.
- **Styling:**
  - High-quality rounded corners (2rem).
  - Subtle shadow (shadow-xl).
  - Soft background tint from the Study's cluster category.

### Interactions
- **Click behavior:** Clicking the image or its title navigates the user to the corresponding Study page (`/science/studies/[id]`).
- **Hover state:** Subtle scale-up animation (1.02x) and border highlight.

## 2. Floating Research Carousel (Widget)
A persistent, interactive widget providing a "quick look" at research findings across the entire Science Hub.

### 2.1 Mini Widget (Collapsed State)
- **Position:** Bottom-right corner of the viewport (persistent in `/science/*` layout).
- **Appearance:** 
  - Circular or rounded-square thumbnail (approx 64x64px).
  - Animated "sliding" transition every 5-10 seconds to show different images.
  - Glowing border or pulse animation to signify interactivity.
- **Constraint:** Should not overlap critical mobile UI elements (like a "back to top" button if present).

### 2.2 Full Carousel (Expanded State)
- **Trigger:** Clicking the Mini Widget.
- **Overlay UI:** 
  - Full-screen backdrop blur (blur-md) with semi-transparent dark overlay.
  - Large central image display.
  - Previous/Next navigation arrows.
  - **Source Info:** Displays Study Title, ID, and full Caption.
  - **CTA:** "Read Full Study" button linking to the study page.
- **Closing:** "X" button in the top-right or clicking outside the carousel container.

## 3. Technical Requirements
- **Data Source:** A build-time generated `images.json` manifest.
- **Performance:** Images should be optimized using `next/image`.
- **Responsive:** 
  - Mini widget scales down on mobile.
  - Full carousel adjusts layout (source info moves below image) on small screens.

## 4. Animation Goals
- **Transitions:** Use Framer Motion for smooth layout transitions between collapsed and expanded states.
- **Feel:** "Medical Precision meets Modern Web" — clean, fast, and informative.

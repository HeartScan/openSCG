---
title: "The Cardiac Cycle Blueprint: SCG Fiducial Points"
description: "A technical hub explaining the fiducial points of Seismocardiography (AO, AC, MO, MC) and their precision relative to echocardiography."
---

# The Cardiac Cycle Blueprint: SCG Fiducial Points

Seismocardiography (SCG) captures the physical vibrations of the heart as it beats. Unlike the ECG, which measures the electrical command to contract, SCG measures the mechanical result—the actual opening and closing of valves, the contraction of the myocardium, and the ejection of blood.

This page serves as a technical reference for the key **fiducial points** (peaks and valleys) of the SCG waveform and their validation against clinical gold standards like Echocardiography.

## 1. The Core Fiducial Points

Peer-reviewed research (most notably *Sørensen 2018 (S002)* and *Crow 1994 (S003)*) has successfully mapped specific SCG waveform features to the actual physiological events of the cardiac cycle. 

| SCG Feature | Physiological Event | Clinical Meaning | Precision vs. Echo |
| :--- | :--- | :--- | :--- |
| **MC** | Mitral Valve Closure | Start of Systole (Isovolumic Contraction) | High Correlation (r=0.71) |
| **AO** | Aortic Valve Opening | Blood is ejected into the Aorta | ±5 ms (MAD) |
| **AC** | Aortic Valve Closure | End of ejection, start of Diastole | ±10 ms (MAD), r=0.94 |
| **MO** | Mitral Valve Opening | Ventricular filling begins | High Correlation (r=0.87) |

---

## 2. Key Clinical Metrics Derived from SCG

By automatically calculating the time between these specific points, modern SCG algorithms can extract powerful clinical metrics without needing an ultrasound probe.

### Pre-Ejection Period (PEP)
*   **Definition:** The time from the electrical command to contract (Q-wave on ECG) to the actual opening of the aortic valve (AO).
*   **Accuracy:** A massive multi-modal validation study (S001) demonstrated that SCG-derived PEP falls within the clinical Echocardiography range **86% of the time** (ICC 0.83).
*   **Clinical Value:** A prolonged PEP is an early indicator of left ventricular dysfunction and ischemia.

### Left Ventricular Ejection Time (LVET)
*   **Definition:** The duration the aortic valve is open (from AO to AC).
*   **Accuracy:** SCG measures LVET with a remarkably low error rate of **3.2%** compared to ultrasound.
*   **Clinical Value:** Shortened LVET can indicate heart failure or severe valve stenosis.

### Tei Index / Myocardial Performance Index (MPI)
*   **Definition:** An index combining both systolic and diastolic time intervals.
*   **Accuracy:** By measuring total systolic time (TST) with 90% accuracy vs Echo (S001), SCG is highly suited for calculating the Tei Index, a robust prognostic marker for congestive heart failure.

---

## 3. The Power of "Preload" Sensitivity

Recent advancements have proven that these micro-intervals are incredibly sensitive to changes in the heart's hemodynamic status. 

In a 2024 physiological challenge study (S012), researchers subjected patients to a 30-degree tilt to alter their "preload" (the volume of blood returning to the heart). 
*   **The Finding:** The systolic intervals measured by SCG (LVET, IVCT) were actually **more sensitive** to these subtle volume shifts than standard echocardiography. 
*   **The Impact:** This explains why SCG is uniquely positioned for monitoring fluid congestion in heart failure patients at home, acting as a highly sensitive mechanical barometer.

---

## 4. Deep Learning: Automating the Blueprint

Historically, annotating AO or AC points on a noisy waveform required a trained expert. Today, this is solved by deep learning.

As validated in the *SeismoTracker* study (S028), modern U-Net deep learning architectures trained on vast datasets can automatically identify up to **11 distinct fiducial points** on a beat-to-beat basis. This model achieved a Positive Predictive Value (PPV) reaching 1.0 in healthy subjects. 

This automation allows for continuous, passive monitoring of mechanical heart function—transforming the smartphone from a simple step-counter into a high-resolution window into the cardiac cycle.

---

### Related Resources
*   [Review of Ground-Truth Echo and MRI Comparisons](/science-hub/comparison/scg-vs-gold-standard)
*   [The Truth-Table: Can a Smartphone Be a Medical Sensor?](/science-hub/synthesis/smartphone-accuracy)
# Smartphone SCG: Technical Authority & Clinical Validation

Seismocardiography (SCG) using consumer smartphones is a rapidly evolving field. This page summarizes the technical foundations, sensor capabilities, and clinical evidence specifically for smartphone-based cardiac monitoring.

## 1. Sensor Mechanics: Why Smartphones Work
Modern smartphones contain high-resolution MEMS (Micro-Electro-Mechanical Systems) accelerometers and gyroscopes capable of capturing the minute vibrations of the chest wall caused by cardiac activity.

*   **Sensitivity:** Commercial sensors can detect accelerations as low as 0.001g, sufficient for capturing the AO (Aortic Opening) and AC (Aortic Closing) peaks.
*   **Multi-axis Sensing:** Modern SCG utilizes 6-axis data (3-axis Accel + 3-axis Gyro). Research shows that **gyroscopes** provide superior signal-to-noise ratio (SNR) for certain cardiac events (**S007**, **S015**).

## 2. Technical Milestones

| Study ID | Milestone | Key Finding |
| :--- | :--- | :--- |
| **S007** | Gyroscope Superiority | Gyro-based mechanocardiography (MCG) is more robust than Accel-based SCG for heart rate variability. |
| **S015** | Sensor Placement | Validated optimal phone placement on the sternum for maximum signal fidelity. |
| **S046** | Real-world Robustness | Achieved **99.8% sensitivity** in AO peak detection across 7,700+ hours of unsupervised field data. |

## 3. Clinical Validation of Smartphone SCG

Smartphone-based SCG has been validated against clinical ECG and imaging for several key use cases:

### A. Atrial Fibrillation (AFib) Detection
The most mature clinical application for smartphone SCG.
*   **Performance:** Sensitivity >99%, Specificity >98% (**S017**, **S036**).
*   **Mechanism:** Detection of irregular "rhythmic spectrum" patterns in mechanical vibrations.

### B. Heart Failure Monitoring
Monitoring hemodynamic changes and fluid status.
*   **S013:** Smartphone SCG distinguished between stable and decompensated heart failure with **92% accuracy**.
*   **S036:** Long-term monitoring (Heartbeat study) showed correlation between SCG morphology and clinical status.

### C. Cardiac Timing & Hemodynamics
*   **S011:** Validated smartphone measurements of PEP and LVET against echocardiography.
*   **S044:** Deep learning applied to smartphone signals can predict aortic hemodynamics comparable to 4D Flow MRI.

## 4. Limitations & Challenges
*   **Body Habitus:** High BMI or skin elasticity can dampen vibrations.
*   **Motion Artifacts:** Signal quality drops significantly during movement (requires "resting" measurements).
*   **Device Heterogeneity:** Different phone models have varying sensor noise floors (addressed by ML normalization in **S046**).

---
*For more technical details, see our [Signal Processing Hub](../synthesis/signal-processing.md) or explore the [Study Index](../studies/index.md).*

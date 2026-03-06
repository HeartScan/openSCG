# Accuracy Comparison: SCG vs. Gold Standards

This page provides a consolidated view of how Seismocardiography (SCG) compares to established clinical "Gold Standards" like Echocardiography, MRI, and Invasive Pressure Monitoring.

## 1. Cardiac Timing & Hemodynamics

| Study ID | Gold Standard | Metric | Correlation / Accuracy | Conclusion |
| :--- | :--- | :--- | :--- | :--- |
| **S001** | Echocardiography | Systolic Time Intervals | **r = 0.90 - 0.98** | SCG is a valid surrogate for LVST/PEP. |
| **S002** | MRI | Cardiac Timing Events | **95.8% Agreement** | SCG accurately identifies AO and AC events. |
| **S034** | Echocardiography | Stroke Volume | **r = 0.82** | SCG can monitor SV trends in CHD patients. |
| **S047** | Echocardiography | Diastolic Function (e') | **r = 0.71** | Diastolic SCG correlates with tissue Doppler. |
| **S044** | 4D Flow MRI | Aortic Peak Velocity | **r = 0.85** | Deep learning SCG predicts complex hemodynamics. |

## 2. Structural Heart Disease & Diagnosis

| Study ID | Condition | Gold Standard | Performance | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **S006** | Coronary Artery Disease | Angiography | **91% Sensitivity** | Highly effective for non-invasive CAD screening. |
| **S044** | Aortic Stenosis | 4D Flow MRI | **AUC 0.99** | SCG/DL identifies valvular pathology with high precision. |
| **S013** | Heart Failure | Clinical Diagnosis | **92% Accuracy** | Distinguishes compensated vs. decompensated HF. |

## 3. Rhythm Analysis

| Study ID | Condition | Gold Standard | Performance | Note |
| :--- | :--- | :--- | :--- | :--- |
| **S017** | Atrial Fibrillation | ECG (Holter) | **99.9% Sensitivity** | Smartphone SCG matches ECG for AFib detection. |
| **S046** | AO Peak Detection | Expert Labeling | **99.8% Sensitivity** | Robust AO detection in field conditions (U-Net v3). |

---

*Note: For detailed methodology and population data, please refer to the individual study pages linked via Study ID.*

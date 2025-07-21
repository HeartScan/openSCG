import numpy as np
from scipy.interpolate import interp1d
from typing import List, Dict

def preprocess_web_signal(samples: List[Dict[str, float]]) -> np.ndarray:
    """
    Takes a list of raw accelerometer samples and resamples them to a regular 100Hz signal.

    This function is adapted from the original HeartScan ML API and is critical for
    transforming noisy, unevenly-timed sensor data into a clean, analyzable waveform.
    """
    if not samples or len(samples) < 2:
        return np.array([])

    timestamps = np.array([float(point.get("t", 0)) for point in samples])
    az_values = np.array([float(point.get("az", 0)) for point in samples])

    start_time_ms = timestamps[0]
    end_time_ms = timestamps[-1]
    duration_ms = end_time_ms - start_time_ms

    if duration_ms <= 0:
        return np.array([])

    # Create a new, evenly-spaced time axis at 100Hz (every 10ms)
    regular_timestamps = np.arange(0, duration_ms, 10)

    # Create the interpolation function
    interp_func = interp1d(
        timestamps - start_time_ms, 
        az_values, 
        kind='linear', 
        bounds_error=False, 
        fill_value="extrapolate"
    )

    # Apply the interpolation to the new time axis
    resampled_signal = interp_func(regular_timestamps)

    return resampled_signal

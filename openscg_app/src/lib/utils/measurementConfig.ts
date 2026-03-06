/**
 * Configuration constants for the heart rate measurement algorithm and UI.
 */
export const MEASUREMENT_CONFIG = {
  // Timing and duration
  TIMER_DURATION: 20000, // Total measurement duration in ms (20 seconds max)
  HEART_RATE_CALCULATION_TIMEOUT: 5000, // API timeout in ms
  COUNTDOWN_SECONDS: 3,
  
  // Algorithm thresholds
  MIN_PEAK_INTERVAL: 400, // Minimum ms between heartbeats (150 BPM max)
  TARGET_HEARTBEATS: 10, // Number of heartbeats required to calculate rate
  MIN_DATA_LENGTH: 1300, // Minimum number of samples required
  MIN_CONFIDENCE_THRESHOLD: 0.4, // Minimum confidence score to accept result
  
  // Buffers and charts
  MAX_CHART_POINTS: 150, // Maximum number of points to display on the chart
  MAX_BUFFER_SIZE: 2000, // Maximum number of data points in the buffer
  
  // Signal processing (MATLAB port specific)
  QUARTER_PERIOD: 20, // Based on ~120BPM at 100Hz sampling
  SMOOTHING_WINDOW: 60,
  MEAN_DEV_WINDOW_FACTOR: 1.8,
};

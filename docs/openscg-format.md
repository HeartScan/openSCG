# OpenSCG Session Format v0.1

This document specifies the standard JSON format for an OpenSCG session. This format is used for data transmission from the client, storage on the server, and delivery to the viewer.

## 1. Guiding Principles

- **Simple:** Easy to generate and parse.
- **Self-Contained:** A single object should contain all necessary information to render a session.
- **Extensible:** The format should allow for future additions (e.g., ML-derived metadata) without breaking backward compatibility.
- **Timestamp-First:** Timestamps are the primary key for data points, enabling accurate interpolation and synchronization.

## 2. Full Session Object

This is the canonical structure for a complete, stored OpenSCG session.

```json
{
  "version": "0.1",
  "sessionId": "a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
  "startedAt": "2025-07-21T14:30:00.123Z",
  "endedAt": "2025-07-21T14:31:00.456Z",
  "samplingRateHz": 98.5,
  "device": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "platform": "iPhone"
  },
  "samples": [
    { "t": 1721574600123, "ax": -0.012, "ay": 0.001, "az": 0.098 },
    { "t": 1721574600133, "ax": -0.011, "ay": 0.002, "az": 0.097 },
    ...
  ]
}
```

### Field Descriptions:

- **`version` (string):** The version of the OpenSCG spec.
- **`sessionId` (string, UUID):** A unique identifier for the measurement session.
- **`startedAt` (string, ISO 8601):** The UTC timestamp when the session was initiated.
- **`endedAt` (string, ISO 8601, optional):** The UTC timestamp when the session was completed.
- **`samplingRateHz` (float):** The calculated average sampling rate of the device sensor.
- **`device` (object):** Information about the client device.
  - **`userAgent` (string):** The browser's user agent string.
  - **`platform` (string):** The value of `navigator.platform`.
- **`samples` (array):** An array of `Sample` objects.
  - **`t` (integer):** The monotonic timestamp for the data point, in milliseconds. This should be derived from `event.timeStamp`.
  - **`ax`, `ay`, `az` (float):** The accelerometer readings for the x, y, and z axes, including gravity.

## 3. Real-Time Transmission Format

For real-time streaming via WebSockets, sending the full session object on every update is inefficient. Instead, the client will send batches of raw samples.

The server will receive these batches, associate them with a session, and broadcast them to viewers.

### Client-to-Server Batch (`c2s_samples_batch`):

This is the payload the patient's client sends to the server every 1-2 seconds.

```json
{
  "sessionId": "a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
  "samples": [
    { "t": 1721574600123, "ax": -0.012, "ay": 0.001, "az": 0.098 },
    { "t": 1721574600133, "ax": -0.011, "ay": 0.002, "az": 0.097 }
  ]
}
```

### Server-to-Viewer Batch (`s2v_samples_batch`):

This is the payload the server broadcasts to the physician's viewer. It includes the interpolated signal for smooth rendering.

```json
{
  "sessionId": "a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
  "interpolatedSamples": [
    { "t": 1721574600120, "az": 0.0981 },
    { "t": 1721574600130, "az": 0.0975 },
    ...
  ]
}
```

- **`interpolatedSamples` (array):** An array containing only the timestamp and the z-axis value of the *interpolated* signal, ready for direct rendering on the chart. We only send `az` to minimize payload size, as it's the primary axis for visualization.

# OpenSCG Session Format v0.2

This document specifies the standard JSON format for an OpenSCG session. This format is used for data transmission from the client, storage on the server, and delivery to the viewer.

## 1. Guiding Principles

- **Simple:** Easy to generate and parse.
- **Self-Contained:** A single object should contain all necessary information to render a session.
- **Optimized (V2):** Uses compact tuples for signal data to minimize bandwidth.
- **Timestamp-First:** Timestamps are the primary key for data points, enabling accurate interpolation and synchronization.

## 2. Full Session Object

This is the canonical structure for a complete, stored OpenSCG session.

```json
{
  "version": "0.2",
  "sessionId": "a7b1c3d5-e8f6-4a9b-8c7d-1e2f3a4b5c6d",
  "startedAt": "2025-07-21T14:30:00.123Z",
  "endedAt": "2025-07-21T14:31:00.456Z",
  "samplingRateHz": 98.5,
  "device": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X)...",
    "platform": "iPhone"
  },
  "samples": [
    [1721574600123, -0.012, 0.001, 0.098],
    [1721574600133, -0.011, 0.002, 0.097]
  ]
}
```

### Field Descriptions:

- **`version` (string):** The version of the OpenSCG spec (v0.2 uses tuples).
- **`sessionId` (string, UUID):** A unique identifier for the measurement session.
- **`startedAt` (string, ISO 8601):** The UTC timestamp when the session was initiated.
- **`endedAt` (string, ISO 8601, optional):** The UTC timestamp when the session was completed.
- **`samplingRateHz` (float):** The calculated average sampling rate of the device sensor.
- **`device` (object):** Information about the client device.
- **`samples` (array):** An array of `Sample` tuples.
  - Each tuple is: `[timestamp_ms, acc_x, acc_y, acc_z]`
  - **`timestamp_ms` (integer):** Monotonic milliseconds.
  - **`acc_x`, `acc_y`, `acc_z` (float):** Accelerometer readings.

## 3. Real-Time Transmission Format (WebSocket Standard)

The system uses an optimized tuple-based format for all real-time transmission.

### Client-to-Server Batch (`c2s_v2_batch`)
The client sends optimized tuples to the server in batches.
```json
{
  "sessionId": "uuid",
  "data": [
    [1721574600123, -0.012, 0.001, 0.098],
    [1721574600133, -0.011, 0.002, 0.097]
  ]
}
```

### Server-to-Viewer Broadcast (`s2v_v2_broadcast`)
The server broadcasts the raw array of tuples to the session room.
```json
[
  [1721574600123, -0.012, 0.001, 0.098],
  [1721574600133, -0.011, 0.002, 0.097]
]
```

## 4. Future Roadmap: V3 Binary Format
For higher performance (1000Hz+), the next standard will utilize **Protocol Buffers** or **FlatBuffers** over binary WebSocket frames.

# OpenSCG JSON Format Specification

## Raw Data Format (as collected)

```json
[
  {
    "ax": -5.2,
    "ay": 0.3,
    "az": 8.4,
    "timestamp": 1743256991352
  },
  // ...
]
```

## Wrapped Format (for API/storage)

```json
{
  "session_id": "uuid",
  "device": "Pixel 6",
  "sampling_rate": 50,
  "data": [
    {"t": 0.00, "x": -0.012, "y": 0.001, "z": 0.098},
    {"t": 0.02, "x": -0.011, "y": 0.002, "z": 0.097}
  ]
}
```

- `session_id`: Unique session identifier (UUID)
- `device`: Device model/name
- `sampling_rate`: Samples per second (Hz)
- `data`: Array of time series samples

> See README for more details and context. 
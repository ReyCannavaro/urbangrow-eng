# 📡 UrbanGrow API Reference Catalog

> **Gateway Endpoint**: `http://localhost:3000` (ElysiaJS Core API)  
> **Predictive Microservice**: `http://localhost:8000` (FastAPI AI Engine)

---

## 🚀 1. Core REST Endpoints

### `GET /api/sensors/current`
Returns the latest real-time sensor snapshot and actuator relay states.
```json
{
  "timestamp": "2026-10-18T16:50:00.000Z",
  "sensors": {
    "ph": 6.85,
    "tds": 620,
    "waterTemperature": 24.8,
    "airTemperature": 28.5,
    "humidity": 72.0,
    "lightIntensity": 18500,
    "dissolvedOxygen": 5.8,
    "waterLevel": 100
  },
  "actuators": [
    { "id": "pump", "name": "Pompa Sirkulasi", "isOn": true, "voltage": "12V DC" },
    { "id": "aerator", "name": "Aerator Oksigen", "isOn": true, "voltage": "220V AC" },
    { "id": "feeder", "name": "Auto Feeder", "isOn": false, "voltage": "5V DC" },
    { "id": "light", "name": "LED Grow Light", "isOn": true, "voltage": "12V DC" }
  ]
}
```

### `POST /api/actuators/:id/toggle`
Safely toggles an actuator with automatic dry-run and duration interlocks.
- **URL Param**: `id` (`pump` | `aerator` | `feeder` | `light`)
- **Response**: `{ "success": true, "actuator": { ... } }`

### `POST /api/sensors/telemetry`
Edge ingestion endpoint used by physical ESP32 or IoT Simulator.

### `GET /api/ai/climate-score`
Returns composite 4-pillar ECAD Climate Adaptation Score (0.0 to 100.0) and actionable insights.

# 🏗️ UrbanGrow Architecture Deep Dive & Dataflow Blueprint

> **Dokumen Teknis**: Alur Data End-to-End Dari Akuisisi Sensor Fisik Hingga Tampilan Dashboard  
> **Institusi**: SMK Telkom Sidoarjo (Regu Mawar)  
> **Status**: Approved System Architecture

---

## 🔄 1. Sequence Diagram Alur Data Telemetri & Prediksi AI

```mermaid
sequenceDiagram
    autonumber
    participant ESP as ⚡ ESP32 Edge / Simulator
    participant GW as ⚡ ElysiaJS Backend (Port 3000)
    participant DB as 🗄️ TimescaleDB (Port 5432)
    participant AI as 🧠 AI Engine (FastAPI Port 8000)
    participant WEB as 💻 Next.js Dashboard (Port 3001)
    participant MOB as 📱 Flutter Mobile App

    loop Setiap 5 Detik
        ESP->>GW: POST /api/sensors/telemetry (6 Metrik Sensor)
        GW->>DB: INSERT into sensor_readings (Hypertable)
        GW->>AI: POST /predict/anomaly & /score/climate-adaptation
        AI-->>GW: JSON { is_anomaly, score, recommendations }
        GW->>WEB: WebSocket Frame Broadcast (Metrics + AI Score)
        GW->>MOB: SSE Stream Broadcast (Metrics + Alerts)
    end
```

---

## 🎛️ 2. Sequence Diagram Kendali Aktuator & Interlock Keamanan

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Pengguna (Web / Mobile)
    participant GW as ⚡ ElysiaJS Gateway
    participant DB as 🗄️ PostgreSQL Logs
    participant ESP as ⚡ ESP32 Hardware Relay

    User->>GW: POST /api/actuators/aerator/toggle
    Note over GW: Periksa Safety Rules & Interlock
    GW->>ESP: MQTT /urbangrow/actuator/aerator/set {"state": true}
    ESP->>ESP: Active-Low Relay ON (GPIO 26)
    ESP-->>GW: MQTT ACK {"status": "ok"}
    GW->>DB: INSERT into actuator_logs
    GW-->>User: HTTP 200 { success: true, state: true }
```

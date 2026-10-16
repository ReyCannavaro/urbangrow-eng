# 🤖 UrbanGrow Multi-Agent System: Master Orchestration Guide (AGENTS.md)

> **Proyek**: *UrbanGrow Smart Aquaponic Berbasis IoT & Predictive AI untuk Sistem Pangan Perkotaan Adaptif terhadap Perubahan Iklim*  
> **Institusi**: SMK Telkom Sidoarjo (Regu Mawar: Reyjuno Al Cannavaro, Gabriella Fajar Setiwan, Marcellina Septya Safira)  
> **Status Monorepo**: Active Multi-Agent Workspace (Moonrepo v2 + Bun + Next.js 16 + ElysiaJS + Flutter + FastAPI + TimescaleDB)

---

## 🧭 1. Arsitektur Multi-Agent & Domain Boundaries

Monorepo UrbanGrow dikelola oleh jaringan agen AI otonom terspesialisasi yang saling melengkapi sesuai prinsip **Separation of Concerns (SoC)** dan **Evidence-Based Climate Adaptive Design (ECAD)**:

```mermaid
graph TD
    MasterAgent[🤖 Root Orchestrator Agent]
    
    MasterAgent --> IoTAgent[⚡ IoT & Embedded Hardware Agent]
    MasterAgent --> BackendAgent[⚡ Backend API Gateway Agent]
    MasterAgent --> DatabaseAgent[🗄️ Database & Time-Series Agent]
    MasterAgent --> FrontendAgent[💻 Frontend Web & Mobile Agent]
    MasterAgent --> AIAgent[🧠 AI Predictive Analytics Agent]
    MasterAgent --> DevOpsAgent[🚀 DevOps & Monorepo Agent]

    IoTAgent -. Telemetry MQTT / HTTP .-> BackendAgent
    BackendAgent -. Ingest Deret Waktu .-> DatabaseAgent
    AIAgent -. Predictive Inference .-> BackendAgent
    BackendAgent -. WebSocket / Eden Treaty .-> FrontendAgent
    DevOpsAgent -. CI/CD & Orchestration .-> MasterAgent
```

---

## 👥 2. Matriks Tanggung Jawab Bidang (Domain Responsibility Matrix)

| Bidang / Agen | Cakupan Direktori | Teknologi Utama | Mandat & Peran Utama |
|---|---|---|---|
| **IoT & Embedded** | `apps/iot-simulator`, hardware specs | ESP32, C++/Arduino, FreeRTOS | Akuisisi 6 sensor (pH, TDS, DS18B20, DHT22, BH1750, Water Level), kendali 4 relay aktuator, fail-safe watchdogs. |
| **Backend Gateway** | `services/backend` | ElysiaJS, Bun, TypeScript, Eden Treaty | High-throughput REST API, WebSocket/SSE telemetri streaming, autentikasi, actuator safety override dispatch. |
| **Database & Time-Series** | `services/backend/src/db`, migrations | PostgreSQL 16, TimescaleDB, Drizzle ORM | Hypertables telemetri, continuous aggregates (1m/1h/1d), retensi data 90 hari, query deret waktu teroptimasi. |
| **Frontend Web** | `apps/web` | Next.js 16, React 19, Tailwind CSS v4, Lucide | Dark-tech analytics dashboard, visualisasi 4-level vertical aquaponic, chart interaktif, real-time indicator cards. |
| **Frontend Mobile** | `apps/mobile` | Flutter 3.x, Dart, Riverpod, Material 3 | Mobile control center, push notifications, offline telemetry caching, modal kendali aktuator darurat. |
| **AI & Data Intelligence** | `services/ai-engine` | Python 3.11, FastAPI, XGBoost, Scikit-Learn | Deteksi anomali multi-variat (Isolation Forest), estimasi waktu panen (GDD), Climate Adaptation Score. |
| **DevOps & Monorepo** | `.moon`, `.github`, `docker` | Moonrepo v2, Docker Compose, GitHub Actions | Orkestrasi build monorepo, task caching, containerization multi-stack, edge deployment (Raspberry Pi/Mini PC). |

---

## 📜 3. Aturan Operasional Global untuk Semua AI Agent

1. **Prinsip Evidence-Based Climate Adaptive Design (ECAD)**:
   - Setiap fitur dan perubahan parameter biologis/teknis harus merujuk pada standar adaptasi iklim:
     - pH air ideal: `6.5 - 7.5`
     - TDS nutrisi ideal: `400 - 800 ppm` (fase vegetatif kangkung & pakcoy)
     - Suhu air ideal: `22 - 27°C` (Ikan Nila & Lele)
     - Target DO air: `>5-6 mg/L` untuk Nila (Level 3), Lele toleran `<3 mg/L` (Level 1)
2. **Kesesuaian Monorepo Moonrepo**:
   - Dilarang menjalankan skrip ad-hoc di luar target Moonrepo. Selalu gunakan `moon run <project>:<task>`.
3. **Komitmen Anti-Regresi**:
   - Agen dilarang memotong (truncate) kode eksisting atau mengganti implementasi nyata dengan placeholder/TODO.
4. **Keamanan Aktuator & Hardware**:
   - Perintah aktuator wajib memiliki batas waktu maksimal (*software timeout*) dan status interlock perangkat keras.

---
name: devops-monorepo-deployment
description: Comprehensive DevOps, Docker container orchestration, and Moonrepo CI/CD skill for the UrbanGrow monorepo. Covers Docker Compose multi-service stacks (TimescaleDB, Mosquitto MQTT, ElysiaJS, FastAPI, Next.js), Moonrepo task caching, GitHub Actions automation, environment variables validation, and edge deployment to mini PCs / Raspberry Pi.
---

# 🐳 DevOps, Docker Orchestration & Monorepo CI/CD

> **Core Focus**: Production and development infrastructure, Docker Compose multi-container environments, and Moonrepo pipelines for the multi-language **UrbanGrow** ecosystem (Bun, Python, Flutter, Next.js, PostgreSQL/TimescaleDB).

---

## 🏗️ 1. ARCHITECTURE OVERVIEW

```
urbangrow-workspace/
├── .moon/
│   ├── workspace.yml          # Project mappings (web, mobile, backend, ai-engine)
│   └── toolchain.yml          # Node, Bun, Python toolchain config
├── docker/
│   ├── docker-compose.yml     # Local dev infrastructure (DB, MQTT, Services)
│   ├── docker-compose.prod.yml # Production edge deployment stack
│   ├── mosquitto/
│   │   └── mosquitto.conf     # MQTT broker config for ESP32
│   └── timescale/
│       └── init.sql           # TimescaleDB hypertable initialization
├── .github/
│   └── workflows/
│       └── ci.yml             # Moonrepo automated PR validation pipeline
└── .env.example               # Unified environment variable template
```

---

## 🐳 2. UNIFIED DOCKER COMPOSE STACK (`docker/docker-compose.yml`)

Runs all foundational services and backends locally with single command:

```yaml
version: '3.8'

services:
  # 1. Time-Series Database
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    container_name: urbangrow-timescale
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: urbangrow_secret_password
      POSTGRES_DB: urbangrow
    ports:
      - "5432:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data
      - ./timescale/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d urbangrow"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - urbangrow-net

  # 2. MQTT Broker for ESP32 Hardware Ingestion
  mosquitto:
    image: eclipse-mosquitto:2
    container_name: urbangrow-mqtt
    ports:
      - "1883:1883"   # Standard MQTT
      - "9001:9001"   # MQTT over WebSockets
    volumes:
      - ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro
    networks:
      - urbangrow-net

  # 3. ElysiaJS Core Backend
  backend:
    build:
      context: ../services/backend
      dockerfile: Dockerfile
    container_name: urbangrow-backend
    environment:
      DATABASE_URL: postgres://postgres:urbangrow_secret_password@timescaledb:5432/urbangrow
      MQTT_BROKER_URL: mqtt://mosquitto:1883
      AI_ENGINE_URL: http://ai-engine:8000
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      timescaledb:
        condition: service_healthy
    networks:
      - urbangrow-net

  # 4. FastAPI Predictive AI Engine
  ai-engine:
    build:
      context: ../services/ai-engine
      dockerfile: Dockerfile
    container_name: urbangrow-ai
    environment:
      PORT: 8000
    ports:
      - "8000:8000"
    networks:
      - urbangrow-net

volumes:
  timescale_data:

networks:
  urbangrow-net:
    driver: bridge
```

---

## 🗄️ 3. TIMESCALEDB HYPERTABLE INITIALIZATION (`docker/timescale/init.sql`)

```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create baseline telemetry table
CREATE TABLE IF NOT EXISTS sensor_readings (
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_id TEXT NOT NULL,
    ph REAL NOT NULL,
    tds INTEGER NOT NULL,
    water_temperature REAL NOT NULL,
    air_temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    light_intensity INTEGER NOT NULL
);

-- Convert standard table into a TimescaleDB Hypertable partitioned by 7-day chunks
SELECT create_hypertable('sensor_readings', 'timestamp', chunk_time_interval => INTERVAL '7 days', if_not_exists => TRUE);

-- Create automatic 1-hour rollup continuous aggregate view for fast dashboard charts
CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_readings_hourly
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', timestamp) AS bucket,
       device_id,
       AVG(ph) AS avg_ph,
       AVG(tds) AS avg_tds,
       AVG(water_temperature) AS avg_water_temp,
       AVG(air_temperature) AS avg_air_temp,
       AVG(humidity) AS avg_humidity
FROM sensor_readings
GROUP BY bucket, device_id
WITH NO DATA;

-- Refresh policy: auto-refresh hourly aggregate every 30 minutes
SELECT add_continuous_aggregate_policy('sensor_readings_hourly',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '30 minutes',
    if_not_exists => TRUE);
```

---

## 🚀 4. MOONREPO MONOREPO ORCHESTRATION

### Root Workspace Commands:
```bash
# Run all development servers concurrently
moon run :dev

# Run specific project dev tasks
moon run backend:dev
moon run web:dev
moon run ai-engine:dev
moon run mobile:dev

# Run typechecks and linting across the whole repository
moon run :check
```

### GitHub Actions CI Workflow (`.github/workflows/ci.yml`):
```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Moonrepo CLI
        uses: moonrepo/setup-moon@v1

      - name: Run Moon Target Verification
        run: moon check --all
```

---

## 🛡️ 5. BEST PRACTICES & DEPLOYMENT CHECKLIST

1. **Edge Resiliency (Local-First)**: Greenhouse aquaponics systems must run locally on an edge gateway (Raspberry Pi 4 / Intel N100 mini PC) with Docker Compose so sensor loops never stop even when the internet is disconnected.
2. **Data Retention Policies**: Always attach a TimescaleDB retention policy (e.g. drop raw second-by-second readings older than 90 days while preserving continuous hourly aggregates indefinitely).
3. **No Direct Root Docker Containers**: Run application containers as non-root users (`USER node` or `USER nonroot`) in production Dockerfiles.
4. **Environment Consistency**: Maintain a strict `.env.example` file checked into Git; never commit actual `.env` secrets.

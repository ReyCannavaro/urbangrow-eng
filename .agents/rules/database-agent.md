# 🗄️ UrbanGrow Database & Time-Series Agent Specification

> **Sub-Bidang**: Relational & Time-Series Storage, Data Retention & Migrations  
> **Teknologi**: PostgreSQL 16, TimescaleDB Extension, Drizzle ORM (TypeScript)  
> **Status**: Production Reference Standard

---

## 🕒 1. TimescaleDB Hypertables & Desain Deret Waktu

Akuaponik IoT menghasilkan aliran data intensif 24/7. Untuk menjaga performa query tanpa degradasi memori, tabel telemetri dikonfigurasi sebagai **TimescaleDB Hypertable**:

```sql
-- Mengaktifkan ekstensi TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Tabel Utama Telemetri Sensor
CREATE TABLE IF NOT EXISTS sensor_readings (
    time TIMESTAMPTZ NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    ph NUMERIC(4, 2) NOT NULL,
    tds_ppm NUMERIC(6, 1) NOT NULL,
    water_temp_c NUMERIC(4, 2) NOT NULL,
    air_temp_c NUMERIC(4, 2) NOT NULL,
    humidity_pct NUMERIC(4, 1) NOT NULL,
    lux NUMERIC(7, 1) NOT NULL,
    dissolved_oxygen NUMERIC(4, 2) NOT NULL,
    water_level_ok BOOLEAN NOT NULL DEFAULT true
);

-- Mengonversi tabel menjadi hypertable dengan chunk time 1 hari
SELECT create_hypertable('sensor_readings', 'time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

-- Indeks komposit untuk filter rentang waktu cepat
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time ON sensor_readings (device_id, time DESC);
```

---

## 📊 2. Continuous Aggregates (1-Hour Rollup)

Untuk modul *Historical Analytics* pada web dashboard, query tidak membaca jutaan baris mentah, melainkan materialized view continuous aggregates:

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_readings_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    device_id,
    AVG(ph) AS avg_ph,
    MIN(ph) AS min_ph,
    MAX(ph) AS max_ph,
    AVG(tds_ppm) AS avg_tds,
    AVG(water_temp_c) AS avg_water_temp,
    AVG(dissolved_oxygen) AS avg_do,
    AVG(humidity_pct) AS avg_humidity
FROM sensor_readings
GROUP BY bucket, device_id;

-- Refresh policy otomatis setiap 30 menit
SELECT add_continuous_aggregate_policy('sensor_readings_hourly',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '30 minutes');
```

---

## 🧹 3. Kebijakan Retensi Data (Data Retention Policy)

- **Raw Readings**: Data mentah dipertahankan selama 90 hari, lalu chunk lama dihapus otomatis dari disk:
  ```sql
  SELECT add_retention_policy('sensor_readings', INTERVAL '90 days');
  ```
- **Hourly Continuous Aggregates**: Data agregat jam dipertahankan hingga 2 tahun untuk studi siklus iklim tahunan.

---

## 💎 4. Integrasi Drizzle ORM (TypeScript)

Drizzle ORM di `services/backend/src/db/schema.ts` bertindak sebagai single source of truth untuk type-safe queries. Dilarang melakukan query raw SQL tanpa sanitasi parameter.

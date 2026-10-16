# ⚡ UrbanGrow Backend API Gateway Agent Specification (`services/backend`)

> **Layanan**: Core Telemetry API & Actuator Gateway  
> **Teknologi**: ElysiaJS, Bun Runtime, TypeBox Validation (`t`), CORS, Drizzle ORM  
> **Port Default**: `3000` (dijalankan via `bun run --watch src/index.ts` atau `moon run backend:dev`)

---

## 🚀 1. Filosofi Rekayasa Backend ElysiaJS

ElysiaJS dipilih untuk memberikan throughput ultra-tinggi (>100.000 req/detik) dengan konsumsi memori minimal pada Bun runtime:

1. **Schema Validation First**:
   - Setiap payload request (`body`, `params`, `query`) wajib divalidasi menggunakan skema TypeBox bawaan Elysia (`t.Object({...})`).
2. **Deterministic Simulator Engine**:
   - `simulator.ts` memelihara in-memory buffer 50 titik telemetri deret waktu dan state relay aktuator, memungkinkan pengujian frontend tanpa ketergantungan database eksternal saat mode offline/standalone.
3. **Low Latency Telemetry Broadcast**:
   - Komunikasi telemetri ke klien web & mobile mengutamakan persistensi connection (SSE / WebSocket) untuk memangkas handshake overhead.

---

## 📡 2. Matriks Rute & Kontrak API

| Endpoint | Method | Input Schema | Deskripsi |
|---|---|---|---|
| `/` | `GET` | None | API healthcheck & metadata catalog |
| `/api/sensors/current` | `GET` | None | Snapshot metrik 6 sensor terbaru |
| `/api/sensors/history` | `GET` | None | 50 titik riwayat deret waktu sensor |
| `/api/alerts` | `GET` | None | Daftar anomali aktif (pH, suhu, DO, air surut) |
| `/api/actuators/:id/toggle` | `POST` | `params: { id: string }` | Saklar on/off relay (pump, aerator, feeder, light) |
| `/api/simulation/anomaly` | `POST` | `body: { type: 'none'\|'ph_drop'\|'heatwave'\|'tds_spike' }` | Trigger injeksi mode anomali untuk simulasi |
| `/api/simulation/sensor-override`| `POST` | `body: Partial<SensorSnapshot>` | Override nilai sensor langsung dari IoT Simulator |
| `/api/feed/dispense` | `POST` | None | Siklus putar servo pakan 3 detik (35g pelet) |
| `/api/telemetry/ws` | `WS` | WebSocket Protocol | Full-duplex real-time telemetry stream |
| `/download/urbangrow.apk` | `GET` | None | Endpoint distribusi berkas APK mobile |

---

## 🛡️ 3. Aturan Keamanan & Interlock Aktuator

- **Feeder Interlock**: Pemanggilan `/api/feed/dispense` memiliki timer otomatis pemutus relay 3.000 ms guna mencegah tumpahan pakan berlebih (*overfeeding*) yang dapat meracuni kolam ikan.
- **Pump Protection**: Jika sensor ketinggian air (*water level*) mendeteksi status kering/surut (`water_level_ok = false`), backend wajib mematikan pompa sirkulasi 12V untuk mencegah motor terbakar (*dry-run protection*).

---

## 🔌 4. Protokol WebSocket Streaming & Heartbeat

Koneksi WebSocket pada `/api/telemetry/ws` mengikuti siklus hidup berikut:
1. **Handshake**: Klien mengirim frame `{ "action": "subscribe", "device_id": "esp32-urbangrow-01" }`.
2. **Heartbeat (Liveness Ping/Pong)**: Backend mengirim `{ "type": "ping" }` setiap 15 detik. Klien wajib merespons `{ "type": "pong" }` dalam 5 detik; jika tidak, koneksi di-terminate untuk mencegah socket leak.
3. **Telemetry Push**: Backend mem-broadcast data telemetri segera setelah data baru diterima dari ingestion queue.

---

## 🗄️ 5. Runbook Migrasi Database Drizzle ORM

Saat melakukan penyesuaian skema di `services/backend/src/db/`:
```bash
# 1. Menghasilkan file migrasi SQL baru
bun x drizzle-kit generate

# 2. Mengeksekusi migrasi ke PostgreSQL TimescaleDB
bun x drizzle-kit migrate

# 3. Inspeksi visual skema via Drizzle Studio (Port 4983)
bun x drizzle-kit studio
```

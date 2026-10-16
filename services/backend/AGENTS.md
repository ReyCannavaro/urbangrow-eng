# ⚡ UrbanGrow Backend API Gateway Agent Specification (`services/backend`)

> **Layanan**: Core Telemetry API & Actuator Gateway  
> **Teknologi**: ElysiaJS, Bun Runtime, TypeBox Validation (`t`), CORS  
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
| `/download/urbangrow.apk` | `GET` | None | Endpoint distribusi berkas APK mobile |

---

## 🛡️ 3. Aturan Keamanan & Interlock Aktuator

- **Feeder Interlock**: Pemanggilan `/api/feed/dispense` memiliki timer otomatis pemutus relay 3.000 ms guna mencegah tumpahan pakan berlebih (*overfeeding*) yang dapat meracuni kolam ikan.
- **Pump Protection**: Jika sensor ketinggian air (*water level*) mendeteksi status kering/surut (`water_level_ok = false`), backend wajib mematikan pompa sirkulasi 12V untuk mencegah motor terbakar (*dry-run protection*).

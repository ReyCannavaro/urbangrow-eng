# ✅ UrbanGrow Cross-Domain Multi-Agent Verification Matrix

> **Tujuan**: Protokol Pengujian Komprehensif Lintas-Domain untuk Memvalidasi Kesiapan Ekosistem UrbanGrow  
> **Target Pengguna**: Semua Agen AI & Developer (Regu Mawar, SMK Telkom Sidoarjo)  
> **Status**: Production Audit Checklist

---

## 🔍 1. Matriks Pengujian End-to-End (E2E Verification Matrix)

| Domain | Parameter Uji | Standar Keberhasilan | Metode Pengujian |
|---|---|---|---|
| **⚡ IoT & Hardware** | ADC Median Filter | Noise tegangan berkurang >80%, tidak ada pembacaan pH/TDS melonjak tiba-tiba. | Injeksi ripple signal pada pin ADC1 ESP32 & log 100 sampel. |
| **⚡ IoT & Hardware** | Watchdog Timer (WDT) | ESP32 me-reboot otomatis dalam 8.000 ms jika terjadi deadlock / loop macet. | Trigger loop tak hingga `while(1){}` via serial command. |
| **⚡ IoT & Hardware** | Fail-Safe Active-Low | Seluruh 4 relay tetap `OFF` saat ESP32 mengalami siklus reboot. | Observasi optocoupler LED saat tombol reset ditekan. |
| **🗄️ Database** | TimescaleDB Hypertables | Tabel `sensor_readings` terpartisi per 1 hari; data tersimpan dengan timezone UTC. | Eksekusi query `SELECT * FROM timescaledb_information.hypertables;`. |
| **🗄️ Database** | Continuous Aggregates | View `sensor_readings_hourly` teragregasi otomatis setiap 30 menit. | Verifikasi row count pada bucket waktu 24 jam terakhir. |
| **⚡ Backend API** | Elysia Throughput | Latensi endpoint `/api/sensors/current` < 15 ms pada 500 concurrent connections. | Benchmark via `bun run` atau `autocannon -c 100 -d 10s`. |
| **⚡ Backend API** | Actuator Interlock | Endpoint `/api/feed/dispense` mematikan relay feeder otomatis setelah 3.000 ms. | Request POST ke `/api/feed/dispense` dan catat timestamp event OFF. |
| **⚡ Backend API** | WebSocket Stream | Klien menerima frame telemetri setiap 5 detik dengan heartbeat ping 15 detik. | Uji koneksi WebSocket via browser developer tools. |
| **🧠 AI Predictive** | Deteksi Anomali | Model Isolation Forest menandai status `is_anomaly: true` saat pH drop < 5.5. | Kirim payload anomali via `POST /predict/anomaly`. |
| **🧠 AI Predictive** | Estimasi Waktu Panen | Model XGBoost menghitung EDH dengan deviasi < 2 hari dari siklus biologis standar. | Evaluasi MAE pada dataset validasi iklim tropis. |
| **🧠 AI Predictive** | Skor Adaptasi Iklim | Indeks komposit terhitung normal pada rentang 0.0 – 100.0. | Kirim variasi kombinasi telemetri stres dan optimal. |
| **💻 Frontend Web** | Dark-Tech Aesthetic | Tampilan visual konsisten: Slate-950, Emerald, Cyan, Glassmorphism, font-mono tabular. | Audit visual pada resolusi 1920x1080 dan 1366x768. |
| **💻 Frontend Web** | Stale Telemetry UX | Muncul banner peringatan amber jika telemetri terhenti >15 detik. | Matikan backend simulator dan amati reaksi UI web. |
| **📱 Frontend Mobile** | Riverpod Reactive | Nilai gauge dan sensor card terbarui instan tanpa jank rendering (60 FPS). | Profiling Flutter DevTools pada Android emulator / device. |
| **📱 Frontend Mobile** | Build APK Rilis | APK terkompilasi sukses dengan arsitektur split-abi tanpa error lint Dart. | Jalankan `flutter build apk --release --split-per-abi`. |
| **🚀 DevOps** | Moonrepo Pipeline | Cache hit tercapai pada task build yang tidak mengalami perubahan source. | Jalankan `moon run :build` dua kali berturut-turut. |
| **🚀 DevOps** | Docker Healthchecks | Seluruh kontainer melaporkan status `healthy` dalam 60 detik pasca `docker compose up`. | Verifikasi via `docker compose ps`. |

---

## 🛠️ 2. Perintah Eksekusi Cepat (Verification Cheat Sheet)

```bash
# 1. Menjalankan linting di seluruh repo
moon run :lint

# 2. Menjalankan backend Elysia
moon run backend:dev

# 3. Menjalankan web dashboard Next.js
moon run web:dev

# 4. Menjalankan IoT Simulator
moon run simulator:dev

# 5. Verifikasi konektivitas backend
curl -i http://localhost:3000/api/sensors/current
```

---

## 🚨 3. Protokol Simulasi Bencana (Disaster Recovery Drills)

1. **Skenario 1: Pemadaman Listrik PLN Mendadak**:
   - Cabut adaptor 12V. Amati sistem beralih otomatis ke Baterai SLA 12V 7Ah tanpa restart board ESP32.
   - Periksa apakah telemetri mengirim flag `power_source: "battery"` ke dashboard web dalam 5 detik.
2. **Skenario 2: Kabel Sensor Terlepas (Floating ADC Input)**:
   - Lepaskan kabel probe pH atau TDS. Validasi bahwa backend tidak crash dan menandai status `SENSOR_DISCONNECTED / INVALID_VOLTAGE`.
3. **Skenario 3: Broker MQTT Offline**:
   - Hentikan broker Mosquitto. Pastikan firmware ESP32 menyimpan data ke buffer lokal dan backend beralih ke mode polling HTTP fallback.


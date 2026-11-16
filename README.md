<div align="center">

# 🌱 UrbanGrow Smart Aquaponic
### *Growing Resilience Through Intelligent Technology*

**Climate-Adaptive Urban Food Ecosystem Berbasis IoT & Predictive AI**

[![Moonrepo](https://img.shields.io/badge/monorepo-moonrepo_v2-8b5cf6?style=for-the-badge&logo=moonrepo)](https://moonrepo.dev)
[![Bun](https://img.shields.io/badge/runtime-bun_1.3-f472b6?style=for-the-badge&logo=bun)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/frontend-next.js_16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![ElysiaJS](https://img.shields.io/badge/backend-elysia_js-7c3aed?style=for-the-badge&logo=elysia)](https://elysiajs.com)
[![Flutter](https://img.shields.io/badge/mobile-flutter_3-02569B?style=for-the-badge&logo=flutter)](https://flutter.dev)
[![FastAPI](https://img.shields.io/badge/ai_engine-fastapi_python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![TimescaleDB](https://img.shields.io/badge/database-timescaledb-FDB515?style=for-the-badge&logo=postgresql)](https://www.timescale.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>Karya Ilmiah & Inovasi Teknologi Pangan Perkotaan</b><br>
  <b>REGU MAWAR — SMK TELKOM SIDOARJO (2026/2027)</b><br>
  <i>Reyjuno Al Cannavaro • Gabriella Fajar Setiwan • Marcellina Septya Safira</i>
</p>

[Quickstart](#-panduan-instalasi--pengembangan-developer-quickstart) • [Arsitektur Monorepo](#-struktur-monorepo-moonrepo) • [Hardware & Simulator](#-arsitektur-perangkat-keras-iot--simulator) • [API & AI](#-integrasi-api-ai--eden-treaty) • [Panduan Kontribusi](#-panduan-kontribusi--alur-kolaborasi) • [Roadmap Riset](#-roadmap--peluang-pengembangan-lanjutan) • [Dokumentasi Lengkap](#-katalog-dokumentasi-teknis-deep-dive)

---

</div>

## 📌 Ringkasan Inovasi

**UrbanGrow** adalah ekosistem pangan rumah tangga perkotaan adaptif terhadap perubahan iklim (*Climate Adaptive Urban Food Ecosystem*) yang mengintegrasikan budidaya akuaponik bertingkat, sensor telemetri **Internet of Things (IoT)**, dan **Predictive Artificial Intelligence (AI)**.

Berbeda dari *smart farming* konvensional yang bersifat **reaktif** (hanya memantau kondisi yang sedang terjadi), UrbanGrow hadir sebagai **Decision Support System yang prediktif dan antisipatif**. Seluruh pemilihan perangkat keras, sensor, algoritma machine learning, hingga pasangan biologis ikan dan sayuran dirumuskan berdasarkan metodologi **Evidence-Based Climate Adaptive Design (ECAD)** dengan rujukan standar internasional (IPCC, FAO, WHO).

---

## 🌟 Tiga Pilar Kebaruan (Novelty)

1. **Evidence-Based Climate Adaptive Design (ECAD Framework)**:  
   Setiap komponen—dari konfigurasi modul catu daya ganda, spektrum fotosintesis lampu LED, hingga pasangan ikan dan tanaman—dipilih berdasarkan bukti ilmiah ketahanan terhadap anomali cuaca ekstrem perkotaan (misal: gelombang panas / *heatwaves*).
2. **Climate Adaptive Predictive AI**:  
   Mengolah data deret waktu (*time-series*) 6 parameter sensor untuk menghasilkan prediksi laju biomassa tanaman, estimasi hari menuju panen (*Estimated Days to Harvest*), deteksi anomali dini (*early warning*), dan **Climate Adaptation Score**.
3. **Historical Analytics & Decision Support Dashboard**:  
   Mentransformasi peran pengguna dari sekadar pemantau pasif menjadi pengambil keputusan yang melek data (*data-driven decision maker*).

---

## 🐟🌱 Desain Ekologis: 4-Level Modular Aquaponic

Untuk memaksimalkan keterbatasan lahan perkotaan, infrastruktur fisik menggunakan rak vertikal bersusun 4 tingkat dengan manajemen gravitasi dan dinamika **Oksigen Terlarut (DO)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4 (PUNCAK): SAYURAN PAKCOY (Brassica rapa subsp. chinensis)     │
│ -> Akar renggang (less dense); memaksimalkan kelolosan oksigen (DO).   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (Aliran Gravitasi)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: IKAN NILA (Oreochromis niloticus)                             │
│ -> Membutuhkan DO tinggi (>5-6 mg/L); menerima limpahan air paling kaya│
│    oksigen dari Level 4 sebelum dikonsumsi tingkat di bawahnya.        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (Limpahan Limbah Organik Amonia)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: SAYURAN KANGKUNG (Ipomoea aquatica)                           │
│ -> Perakaran masif dan rapat; bertindak sebagai biofilter amonia yang  │
│    sangat kuat, namun menyerap oksigen dalam aliran air.              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (Aliran Rendah DO)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1 (DASAR): IKAN LELE (Clarias sp.)                               │
│ -> Memiliki organ pernapasan tambahan (arborescent organ); sangat      │
│    toleran terhadap DO rendah dan air minim oksigen.                   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           [Pompa Sirkulasi 12V DC] ─┴─> Resirkulasi Tertutup Kembali ke Level 4
```

---

## ⚡ Arsitektur Perangkat Keras IoT & Simulator

* **Pusat Kendali Microcontroller**: ESP32 DevKit V1 (FreeRTOS, Hardware Watchdog Timer, NTP UTC timestamping, Wi-Fi 802.11 b/g/n).
* **Manajemen Daya Ganda (Dual Power)**: Adaptor 12V DC + Baterai Cadangan 12V 7Ah (mitigasi pemadaman listrik perkotaan) dengan modul DC-DC Step Down (jalur 12V aktuator, jalur 5V sensor).
* **6 Parameter Sensor (Input)**:
  1. **pH Sensor (PH-4502C)** — Kualitas keasaman air (target ideal `6.5 - 7.5`).
  2. **Analog TDS Meter** — Kepekatan nutrisi pupuk terlarut (target `400 - 800 ppm`).
  3. **DS18B20 Waterproof** — Suhu air kolam (target ideal `22 - 27°C`).
  4. **DHT22** — Suhu & kelembapan udara lingkungan sekitar rak.
  5. **BH1750 / LDR** — Intensitas pencahayaan fotosintesis (Lux).
  6. **Water Level Sensor** — Deteksi batas ketinggian air tandon utama.
* **4 Aktuator Relay (Output)**:
  1. Pompa Air Sirkulasi 12V DC
  2. Dual-Port Aerator (Injeksi Oksigen Terlarut / DO Booster)
  3. Automatic Fish Feeder (Pemberi pakan pelet terjadwal)
  4. Full-Spectrum LED Grow Light (Pencahayaan fotosintesis indoor)
* **Software Telemetry Simulator**: Tersedia modul simulator berbasis web (`apps/iot-simulator`) untuk melakukan pengujian dan pengembangan frontend/backend tanpa memerlukan perangkat keras fisik.

---

## 📂 Struktur Monorepo (Moonrepo)

Repository ini mengadopsi monorepo modern yang diorkestrasi oleh **[Moonrepo v2](https://moonrepo.dev)**:

```
urbangrow-workspace/
├── .moon/                         # Orkestrasi workspace Moonrepo & task caching
├── .agents/                       # AI Agent Rules, Manifest, & 28 domain-specific skills
├── apps/
│   ├── web/                       # Frontend Web Dashboard (Next.js 16, React 19, Tailwind CSS v4)
│   ├── mobile/                    # Mobile Control Center (Flutter 3.x, Riverpod, Material 3)
│   └── iot-simulator/             # IoT Hardware Simulator (Vite, React 19, Tailwind CSS v4)
├── services/
│   ├── backend/                   # Core API Gateway & Telemetry Stream (ElysiaJS, Bun, Drizzle ORM)
│   └── ai-engine/                 # Predictive ML Analytics Microservice (FastAPI, Python 3.11, XGBoost)
├── firmware/
│   ├── esp32_urbangrow/           # Firmware ESP32 utama (C++/Arduino, FreeRTOS, MQTT/HTTP)
│   └── SELARAS_IOT_POMPA_PlatformIO/ # Proyek firmware alternatif berbasis PlatformIO
├── docker/                        # Konfigurasi containerization (Mosquitto MQTT, TimescaleDB)
├── docs/                          # Buku panduan arsitektur, SOP kalibrasi, & biologi akuaponik
└── scripts/                       # Skrip automasi operasional & helper AWS EC2
```

---

## 🚀 Panduan Instalasi & Pengembangan (Developer Quickstart)

Panduan berikut ditujukan bagi siapa saja yang ingin menjalankan, menguji, atau mengembangkan proyek UrbanGrow di komputer lokal (*local development*).

### 📋 Prasyarat Sistem
Pastikan perangkat kamu telah terpasang:
* **[Bun](https://bun.sh)** (v1.2+) — Runtime JavaScript/TypeScript utama.
* **[Node.js](https://nodejs.org)** (v20+) & **[Moonrepo CLI](https://moonrepo.dev)**:
  ```bash
  npm install -g @moonrepo/cli
  ```
* **[Python](https://www.python.org/)** (v3.11+) *(diperlukan untuk menjalankan `services/ai-engine`)*
* **[Flutter SDK](https://flutter.dev/)** (v3.24+) *(diperlukan jika mengembangkan `apps/mobile`)*
* **[Docker](https://www.docker.com/) & Docker Compose** *(opsional: untuk menjalankan TimescaleDB & Mosquitto lokal)*

---

### 1. Kloning Repository
```bash
git clone https://github.com/ReyCannavaro/urbangrow-eng.git
cd urbangrow-eng
```

---

### 2. Konfigurasi Environment Variables (`.env`)

Setiap layanan memiliki file konfigurasi contoh yang siap digunakan:

#### a. Backend ElysiaJS (`services/backend`)
Salin file konfigurasi contoh:
```bash
cp services/backend/.env.example services/backend/.env
```
Isi konfigurasi di dalam `services/backend/.env`:
```env
PORT=3000

# Google Gemini AI Key (Dapatkan gratis di https://aistudio.google.com/apikey)
# Mendukung multi-key pool (pisahkan dengan koma untuk rotasi otomatis):
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Endpoint Opsional
AI_ENGINE_URL=http://localhost:8000
MQTT_BROKER_URL=mqtt://localhost:1883
DATABASE_URL=postgres://urbangrow_admin:urbangrow_secret_2026@localhost:5432/urbangrow
```
> [!NOTE]
> Jika `DATABASE_URL` PostgreSQL tidak tersedia, backend secara otomatis beralih menggunakan **SQLite local database** (`services/backend/data/urbangrow.sqlite`) tanpa konfigurasi tambahan!

#### b. Frontend Web Next.js (`apps/web`)
```bash
cp apps/web/.env.example apps/web/.env.local
```
Secara default, biarkan `NEXT_PUBLIC_API_URL` kosong agar Next.js menggunakan proxy bawaan ke `http://localhost:3000`.

#### c. Firmware ESP32 (`firmware/esp32_urbangrow`)
Jika kamu menggunakan mikrokontroler fisik:
```bash
cp firmware/esp32_urbangrow/secrets.h.example firmware/esp32_urbangrow/secrets.h
```
Sesuaikan kredensial Wi-Fi dan IP lokal komputer kamu.

---

### 3. Instalasi Dependensi Seluruh Layanan

```bash
# 1. Install dependensi Backend, Web, dan Simulator
cd services/backend && bun install && cd ../..
cd apps/web && bun install && cd ../..
cd apps/iot-simulator && bun install && cd ../..

# 2. Setup environment AI Engine (Python)
cd services/ai-engine
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt
cd ../..

# 3. Setup dependensi Mobile (Flutter) - Opsional jika mengembangkan aplikasi ponsel
cd apps/mobile
flutter pub get
cd ../..
```

---

### 4. Menjalankan Sistem di Lingkungan Lokal

Kamu dapat memilih menjalankan komponen secara terpisah atau sekaligus menggunakan **Moonrepo**:

#### Opsi A: Menjalankan Per Layanan (Direkomendasikan saat Develop)

* **Menjalankan Backend ElysiaJS** (Port 3000):
  ```bash
  moon run backend:dev
  # atau: cd services/backend && bun run dev
  ```
  *Akses healthcheck:* `http://localhost:3000/health`

* **Menjalankan Dashboard Web Next.js** (Port 3001):
  ```bash
  moon run web:dev
  # atau: cd apps/web && bun run dev
  ```
  *Buka di browser:* `http://localhost:3001`

* **Menjalankan IoT Hardware Simulator Web**:
  ```bash
  moon run simulator:dev
  # atau: cd apps/iot-simulator && bun run dev
  ```
  *Buka di browser:* `http://localhost:5173`

* **Menjalankan AI Engine Microservice** (FastAPI - Port 8000):
  ```bash
  moon run ai-engine:dev
  # atau: cd services/ai-engine && uvicorn main:app --reload --port 8000
  ```
  *Akses Swagger UI:* `http://localhost:8000/docs`

* **Menjalankan Aplikasi Mobile (Flutter)**:
  ```bash
  moon run mobile:dev
  # atau: cd apps/mobile && flutter run
  ```

#### Opsi B: Menjalankan Semua Layanan Serentak
```bash
moon run :dev
```

#### Opsi C: Menjalankan Infrastruktur Database & MQTT via Docker
Jika kamu ingin menjalankan PostgreSQL TimescaleDB dan Mosquitto MQTT broker lokal secara kontainer:
```bash
docker compose up -d timescaledb mosquitto
```

---

## 🧪 Pengujian Tanpa Hardware Fisik (IoT Simulator & Stress Testing)

Bagi pengembang yang tidak memiliki modul mikrokontroler ESP32 fisik, sistem UrbanGrow dirancang modular agar tetap dapat diuji 100%:

1. **Dashboard Stress Test Injections**:
   Pada dashboard web (`http://localhost:3001`), buka panel simulasi untuk menginjeksi 4 skenario iklim ekstrem:
   * *Normal Balance*: Kondisi kimia air optimal.
   * *Drop pH (5.8)*: Simulasi guyuran air hujan asam perkotaan.
   * *Heatwave Spike (30°C)*: Simulasi gelombang panas ekstrem.
   * *TDS Overdose*: Simulasi kelebihan konsentrasi pupuk cair.
2. **IoT Simulator App (`apps/iot-simulator`)**:
   Aplikasi simulator interaktif ini memancarkan payload telemetri real-time dengan noise acak (*Gaussian jitter*) menuju endpoint WebSocket/REST backend.

---

## 🔌 Integrasi API, AI & Eden Treaty

UrbanGrow menerapkan arsitektur *Zero-Drift Contract Synchronization*:

* **Eden Treaty Type Sharing**: Definisi skema dan tipe API diekspor langsung dari backend ElysiaJS (`export type App = typeof app`) dan dikonsumsi langsung oleh client frontend tanpa duplikasi manual tipe data.
* **Protokol Telemetri Real-Time**:
  * `GET /api/telemetry/live`: Mengalirkan telemetri sensor setiap 5 detik melalui **Server-Sent Events (SSE)**.
  * `POST /api/telemetry`: Endpoint ingest data dari mikrokontroler ESP32 / Simulator.
  * `POST /api/actuators/control`: Mengubah status relai aktuator (Pompa, Aerator, Pakan, Grow Light) dengan validasi interlock.
  * `POST /api/ai/chat`: Chatbot konsultasi budidaya cerdas (*AgriBot*) ditenagai Google Gemini AI dengan riwayat telemetri real-time.
* **AI Engine Inference Endpoints** (FastAPI):
  * `POST /predict/anomaly`: Deteksi anomali multi-variat deret waktu (*Isolation Forest*).
  * `POST /predict/harvest`: Estimasi hari panen berdasarkan *Growing Degree Days (GDD)* dan biomassa.
  * `POST /score/climate-adaptation`: Penghitungan metrik skor ketahanan iklim (0–100).

---

## 🤝 Panduan Kontribusi & Alur Kolaborasi

Kami sangat menyambut kontribusi dari pengembang, peneliti, maupun pegiat pertanian perkotaan!

### 🌿 Standar Branching
* `main`: Branch stabil untuk deployment produksi.
* `dev`: Branch integrasi aktif untuk pengembangan fitur baru.
* `feature/<nama-fitur>`: Branch untuk penambahan fitur spesifik (contoh: `feature/turbidity-sensor`).
* `fix/<nama-bug>`: Branch untuk perbaikan masalah (contoh: `fix/telemetry-reconnect`).

### 🛠️ Alur Pembuatan Pull Request (PR)
1. **Fork** repository ini ke akun GitHub kamu.
2. Buat branch baru dari branch `dev`:
   ```bash
   git checkout -b feature/nama-fitur-kamu
   ```
3. Lakukan modifikasi kode dengan berpegang pada:
   * **Prinsip Anti-Regresi**: Dilarang menghapus fungsi eksisting atau mengganti implementasi nyata dengan placeholder/TODO.
   * **Evidence-Based Climate Adaptive Design (ECAD)**: Setiap penambahan batas ambang biologis/sensor harus merujuk pada standar ilmiah.
4. Pastikan semua pengujian lulus:
   ```bash
   cd services/backend && bun test
   cd ../../apps/web && bun run lint
   ```
5. Commit perubahan menggunakan standar **Conventional Commits**:
   ```bash
   git commit -m "feat(telemetry): integrasikan sensor kekeruhan air turbidity analog"
   ```
6. Push branch ke repository fork kamu dan buat **Pull Request (PR)** yang diarahkan ke branch **`dev`**.

---

## 🗺️ Roadmap & Peluang Pengembangan Lanjutan

Berdasarkan evaluasi riset dan masukan panel juri pada kompetisi karya ilmiah, berikut adalah beberapa area terbuka (*open issues*) yang sangat potensial untuk dikembangkan bersama oleh para kontributor:

- [ ] 🌧️ **Integrasi Sensor Curah Hujan & Mekanisme Atap Geser Otomatis**:
  * *Tantangan*: Air hujan perkotaan di daerah industri memiliki keasaman tinggi (hujan asam) yang dapat merusak kestabilan pH tandon air secara mendadak.
  * *Rencana*: Menambahkan sensor tetes hujan (*Raindrop / Tipping Bucket Sensor*) yang terhubung ke motor servo/stepper untuk menutup kanopi/atap pelindung kolam secara otomatis saat hujan terdeteksi.
- [ ] 💧 **Sensor Kekeruhan Air (*Turbidity Sensor*)**:
  * *Tantangan*: Akumulasi sisa pelet pakan dan feses ikan lele/nila yang tidak terurai dapat menyumbat biofilter dan mengganggu insang ikan.
  * *Rencana*: Menambahkan sensor turbidity optik analog untuk memicu notifikasi backwash biofilter atau sirkulasi air tambahan.
- [ ] 🧪 **Otomasi Dosing Pump (Auto Chemical Balancer)**:
  * *Tantangan*: Koreksi manual saat pH drop atau TDS berkurang memakan waktu petani perkotaan.
  * *Rencana*: Menambahkan 2 unit mini peristaltic pump untuk mendosis cairan penyangga (*pH Down / pH Up*) dan pupuk nutrisi pekat AB Mix secara mikro (*PID loop*).
- [ ] 📱 **Push Notification & Integrasi Mobile FCM**:
  * *Rencana*: Pengiriman push notification peringatan dini (*early warning*) ke aplikasi smartphone Android/iOS saat AI mendeteksi anomali kritis.
- [ ] 🧠 **Fine-Tuning Dataset AI Panen di Iklim Mikro Tropis**:
  * *Rencana*: Pengumpulan data panen aktual jangka panjang di area Sidoarjo/Surabaya untuk meningkatkan akurasi regresi XGBoost estimasi hari panen.

---

## 📚 Katalog Dokumentasi Teknis (Deep-Dive)

Dokumentasi arsitektur, kimia air, dan petunjuk operasional lengkap tersedia pada direktori [`docs/`](./docs/):

| Dokumen | Deskripsi & Cakupan |
|---|---|
| [📘 ARCHITECTURE_DEEP_DIVE.md](./docs/ARCHITECTURE_DEEP_DIVE.md) | Blueprint arsitektur monorepo, topologi jaringan IoT, dan alur streaming data. |
| [📡 API_REFERENCE.md](./docs/API_REFERENCE.md) | Katalog lengkap endpoint REST API, payload request/response, dan event WebSocket. |
| [🔌 CIRCUIT_DIAGRAM_SPECS.md](./docs/CIRCUIT_DIAGRAM_SPECS.md) | Skematik rangkaian elektronik ESP32, pinout ADC, relay module, dan jalur catu daya. |
| [🧪 SENSOR_CALIBRATION_SOP.md](./docs/SENSOR_CALIBRATION_SOP.md) | Prosedur Standar Operasional (SOP) kalibrasi 2 titik buffer pH dan TDS meter. |
| [💧 WATER_CHEMISTRY_GUIDE.md](./docs/WATER_CHEMISTRY_GUIDE.md) | Panduan siklus nitrogen (Amonia -> Nitrit -> Nitrat), buffer bikarbonat, dan DO. |
| [🐟🌱 BIOLOGICAL_PAIRING_GUIDE.md](./docs/BIOLOGICAL_PAIRING_GUIDE.md) | Rujukan biologis simbiosis Ikan Nila, Ikan Lele, Kangkung, dan Pakcoy. |
| [🚀 DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) | Panduan deployment server produksi ke AWS EC2 Ubuntu, Nginx reverse proxy, dan Vercel. |
| [🎨 DESIGN.md](./docs/DESIGN.md) | Sistem desain visual *dark-tech*, palet warna, tipografi, dan standar UI dashboard web. |
| [📱 MOBILE-DEV.md](./docs/MOBILE-DEV.md) | Panduan arsitektur Flutter 3.x, Riverpod state management, dan UI mobile app. |
| [⚡ ENERGY_MANAGEMENT_SPEC.md](./docs/ENERGY_MANAGEMENT_SPEC.md) | Spesifikasi konsumsi daya modul dual-power (12V DC Adapter + 12V 7Ah SLA Battery). |
| [🛡️ SECURITY_INCIDENT_RUNBOOK.md](./docs/SECURITY_INCIDENT_RUNBOOK.md) | SOP mitigasi insiden keamanan jaringan IoT, fail-safe relay, dan software watchdog. |
| [⚡ ACTUATOR_LATENCY_OPTIMIZATION.md](./docs/ACTUATOR_LATENCY_OPTIMIZATION.md) | Pengujian dan optimasi latensi respon aktuator jaringan lokal vs cloud. |

---

## 📜 Lisensi & Hak Cipta

Proyek ini dilisensikan di bawah lisensi open-source **[MIT License](https://opensource.org/licenses/MIT)**.  
Hak Cipta © 2026 **Regu Mawar — SMK Telkom Sidoarjo**.

Dikembangkan dengan dedikasi untuk memajukan penelitian, kemandirian pangan, dan inovasi teknologi adaptif terhadap perubahan iklim di Indonesia. 🇮🇩🌱

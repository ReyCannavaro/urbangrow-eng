# 🌿 UrbanGrow Smart Aquaponic: Context & Architectural Blueprint

> **Judul Proyek**: *Rancang Bangun UrbanGrow Smart Aquaponic Berbasis IoT dan AI untuk Sistem Pangan Perkotaan Adaptif terhadap Perubahan Iklim: Growing Resilience Through Intelligent Technology*  
> **Tim Pengembang (Regu Mawar)**:
> - **Reyjuno Al Cannavaro**
> - **Gabriella Fajar Setiwan**
> - **Marcellina Septya Safira**  
> **Institusi**: SMK Telkom Sidoarjo (Tahun Ajaran 2026/2027)

---

## 📖 1. Ringkasan Eksekutif & Filosofi Desain

**UrbanGrow** adalah *Climate-Adaptive Urban Food Ecosystem* berbasis **Internet of Things (IoT)** dan **Artificial Intelligence (AI)** yang dirancang untuk membantu rumah tangga perkotaan memproduksi pangan mandiri (protein ikan dan sayuran segar) pada lahan terbatas, sekaligus beradaptasi terhadap perubahan iklim dan cuaca ekstrem.

### 🌟 Filosofi Utama: *Evidence-Based Climate Adaptive Design (ECAD)*
Berbeda dari *smart farming* konvensional yang mayoritas bersifat **reaktif** (hanya memantau kondisi saat ini atau menyalakan saklar setelah suhu naik), UrbanGrow mentransformasi sistem menjadi **Decision Support System yang prediktif dan antisipatif**. Seluruh pemilihan perangkat keras, sensor, algoritma kecerdasan buatan, hingga pasangan biologis ikan dan tanaman dirumuskan berdasarkan bukti literatur ilmiah internasional (FAO, IPCC, WHO).

---

## 🐟🌱 2. Desain Ekologis & Pasangan Biologis (Scientific Biological Pairing)

UrbanGrow menerapkan sistem akuaponik bertingkat 4 level (**4-Level Modular Vertical Aquaponics**) dengan prinsip gravitasi dan manajemen oksigen terlarut (*Dissolved Oxygen / DO*):

```
[Level 4: Puncak]  -->  Sayuran Pakcoy (Akar renggang / less dense, meloloskan DO tinggi)
       │ (Gravitasi)
       ▼
[Level 3]          -->  Ikan Nila (Oreochromis niloticus - Butuh DO tinggi, air paling segar)
       │ (Gravitasi & Limpahan Limbah Organik Nila)
       ▼
[Level 2]          -->  Sayuran Kangkung (Akar masif/biofilter kuat pengurai amonia, menyerap DO)
       │ (Gravitasi)
       ▼
[Level 1: Dasar]   -->  Ikan Lele (Clarias sp. - Sangat toleran DO rendah & kondisi minim oksigen)
       │
       └──[Pompa Sirkulasi 12V DC]──> Kembali ke Level 4 (Closed-Loop Resirkulasi Air)
```

### 🔬 Landasan Ilmiah Pasangan Biologis:
1. **Model Pasangan 1 (Level 1 & 2)**: **Ikan Lele (*Clarias sp.*) & Sayuran Kangkung (*Ipomoea aquatica*)**
   - Karakteristik: Kangkung memiliki perakaran masif yang sangat efektif menyerap amonia dan nitrat, namun menurunkan kadar DO air. Lele memiliki organ pernapasan tambahan (*arborescent organ*) sehingga sangat toleran terhadap DO rendah. Kangkung cepat panen dan kaya zat besi, Vit A, Vit C.
2. **Model Pasangan 2 (Level 3 & 4)**: **Ikan Nila (*Oreochromis niloticus*) & Sayuran Pakcoy (*Brassica rapa subsp. chinensis*)**
   - Karakteristik: Nila memerlukan kadar DO tinggi (>5–6 mg/L). Pakcoy diletakkan di puncak karena perakarannya renggang, menjaga air tetap beroksigen tinggi sebelum masuk ke kolam Nila. Pakcoy kaya Vit K, folat, kalsium, dan antioksidan.
3. **Circular Zero-Waste**: Limbah kotoran ikan diubah bakteri nitrifikasi (*Nitrosomonas & Nitrobacter*) menjadi nitrat untuk nutrisi tanaman; tanaman memfilter air hingga bersih dan mengalirkannya kembali ke ikan tanpa limbah terbuang.

---

## ⚡ 3. Arsitektur Perangkat Keras (Hardware & IoT Edge)

Topologi terpusat dengan mikrokontroler **ESP32 DevKit V1** yang beroperasi stabil 24/7 dengan 4 blok subsistem:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SISTEM CATU DAYA GANDA (DUAL POWER)               │
│  Adaptor Utama 12V DC  +  Baterai Cadangan 12V 7Ah (Mitigasi Blackout) │
│            └──> Modul DC-DC Step Down (12V Aktuator / 5V Logika Sensor)│
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ESP32 DEVKIT V1 (CORE CONTROLLER)                    │
│   - FreeRTOS Task Scheduling & Hardware Watchdog Timer (WDT)           │
│   - Sinkronisasi Waktu Real-Time NTP (UTC Time-Series)                │
│   - WiFi 802.11 b/g/n & Telemetri MQTT / HTTP REST Ingestion           │
├───────────────────────────────────┬────────────────────────────────────┤
│       AKUISISI SENSOR (INPUT)     │      PENGGERAK RELAY (OUTPUT)      │
│ 1. pH Sensor (PH-4502C) - ADC1    │ 1. Pompa Air Sirkulasi 12V         │
│ 2. Analog TDS Meter - ADC1        │ 2. Dual-Port Aerator (DO Booster)  │
│ 3. DS18B20 (Suhu Air Waterproof)  │ 3. Automatic Fish Feeder           │
│ 4. DHT22 (Suhu & Kelembapan Udara)│ 4. Full-Spectrum LED Grow Light    │
│ 5. LDR / BH1750 (Intensitas Lux)  │                                    │
│ 6. Water Level Sensor (Tandon Air)│                                    │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 🧠 4. Arsitektur Kecerdasan Buatan (Climate-Adaptive Predictive AI)

Beroperasi pada [`services/ai-engine`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/services/ai-engine) (Python, FastAPI, Scikit-Learn, XGBoost):

### 🔄 Alur AI Pipeline (4 Siklus):
1. **Data Ingestion**: Menerima data deret waktu (*time-series*) 6 sensor dengan timestamp terstandarisasi.
2. **Data Pre-processing**: Pembersihan noise ADC, median filter, normalisasi data, dan penyelarasan interval waktu.
3. **Predictive Modeling**:
   - **Multi-Variate Anomaly Detection**: Model *Isolation Forest* mendeteksi krisis air sebelum mencapai titik kritis (misal: suhu naik cepat & DO drop).
   - **Harvest & Biomass Forecasting**: Model *XGBoost* memprediksi estimasi hari menuju panen (*Estimated Days to Harvest*) berdasarkan akumulasi suhu termal (*Growing Degree Days - GDD*) dan jam fotosintesis LED.
   - **Nutrient & Environment Advisory Engine**: Algoritma rekomendasi dosis nutrisi (pH buffer, kelat besi, penambahan air bersih).
   - **Climate Adaptation Score**: Indeks komposit (0–100) yang mengukur tingkat ketahanan ekosistem terhadap stres lingkungan.
4. **Feedback Loop & Self-Learning**: Validasi hasil prediksi dengan data aktual lapangan untuk retrain bobot model secara berkala.

---

## 💻 5. Arsitektur Perangkat Lunak 4-Lapisan (Software Stack)

| Lapisan Arsitektur | Teknologi / Framework | Deskripsi Fungsional |
|---|---|---|
| **Layer 1: Edge & Ingestion** | ESP32 (C++/Arduino), MQTT / HTTP | Akuisisi sensor, timestamping, threshold safety rules, fail-safe relay |
| **Layer 2: Storage & Time-Series** | PostgreSQL + TimescaleDB | Hypertables, continuous 1-hour rollups, data retention policy 90 hari |
| **Layer 3: Core API & Gateway** | ElysiaJS (Bun), Drizzle ORM | REST API, WebSocket/SSE telemetry streaming, Eden Treaty type safety |
| **Layer 4: AI & Data Intelligence** | Python 3.11, FastAPI, XGBoost | Machine learning microservice, deteksi anomali, estimasi panen |
| **Layer 5: Presentation Dashboard** | Next.js 16, Tailwind CSS, Flutter | Web Analytics Dashboard (`apps/web`) & Mobile Control Center (`apps/mobile`)|

---

## 🖥️ 6. Empat Modul Antarmuka Pengguna (Decision Support Dashboard)

1. **Modul Ecosystem Overview**:
   - Status stabilitas ekosistem real-time, 6 kartu metrik (pH, TDS, suhu air, suhu udara, kelembaban, intensitas cahaya, DO), serta indikator level tandon air.
2. **Modul Smart Aquaponics Control Center**:
   - Panel kendali 4 relay aktuator (Pompa Sirkulasi, Aerator O2, Automatic Feeder, LED Grow Light) dengan opsi mode *Auto* atau *Manual Override*.
3. **Modul Historical Analytics**:
   - Grafik interaktif multi-metrik deret waktu (harian, mingguan, bulanan) untuk menganalisis tren kualitas air terhadap perubahan cuaca perkotaan.
4. **Modul AI Predictive Analytics & Climate Adaptation**:
   - Estimasi tanggal panen, proyeksi biomassa sayuran & ikan, *Early Warning System*, serta skor indeks ketahanan iklim (*Climate Adaptation Score*).

---

## 🚀 7. Struktur Monorepo (Moonrepo Workspace)

```
urbangrow-workspace/
├── .moon/                     # Moonrepo workspace & project mappings
├── .agents/                   # Standar AI Coding Agent, Skills, & Rulebooks
│   ├── skills/                # 28 skill terpasang (Backend, Hardware, AI, Mobile, DevOps, Taste)
│   └── USESKILL.md            # Direktori panduan alur kerja skill
├── docs/                      # Dokumen proposal penelitian & spesifikasi teknis
│   └── proposal.docx          # Naskah lengkap proposal karya ilmiah
├── apps/
│   ├── web/                   # Next.js 16 + Tailwind CSS (Web Analytics Dashboard)
│   └── mobile/                # Flutter 3.x + Riverpod (Mobile Control Center)
└── services/
    ├── backend/               # ElysiaJS + Bun + Drizzle ORM (Core API & Telemetry)
    └── ai-engine/             # Python + FastAPI + Scikit-Learn (Predictive ML Engine)
```

---

## 🎯 8. Panduan Eksekusi Project (Cheat Sheet)

```bash
# Menjalankan Backend Elysia (Port 3000)
moon run backend:dev

# Menjalankan Dashboard Web Next.js (Port 3001)
moon run web:dev

# Menjalankan Semua Layanan Secara Bersamaan
moon run :dev
```
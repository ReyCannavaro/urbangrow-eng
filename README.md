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

<p align="center">
  <b>Karya Ilmiah & Inovasi Teknologi Pangan Perkotaan</b><br>
  <b>REGU MAWAR — SMK TELKOM SIDOARJO (2026/2027)</b><br>
  <i>Reyjuno Al Cannavaro • Gabriella Fajar Setiwan • Marcellina Septya Safira</i>
</p>

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

## ⚡ Arsitektur Perangkat Keras & IoT Edge

* **Pusat Kendali**: ESP32 DevKit V1 (FreeRTOS, Hardware Watchdog Timer, NTP UTC timestamping, Wi-Fi 802.11 b/g/n).
* **Manajemen Daya Ganda (Dual Power)**: Adaptor 12V DC + Baterai Cadangan 12V 7Ah (mitigasi pemadaman listrik perkotaan) dengan modul DC-DC Step Down (jalur 12V aktuator, jalur 5V sensor).
* **6 Parameter Sensor (Input)**:
  1. pH Sensor (PH-4502C) — Kualitas keasaman air (target 6.5–7.5).
  2. Analog TDS Meter — Kepekatan nutrisi terlarut (target 400–800 ppm).
  3. DS18B20 Waterproof — Suhu air kolam (target 22–27°C).
  4. DHT22 — Suhu & kelembapan udara lingkungan.
  5. LDR / BH1750 — Intensitas pencahayaan fotosintesis (Lux).
  6. Water Level Sensor — Deteksi batas ketinggian tandon air.
* **4 Aktuator Relay (Output)**:
  1. Pompa Air Sirkulasi 12V
  2. Dual-Port Aerator (Injeksi Oksigen Terlarut / DO Booster)
  3. Automatic Fish Feeder (Pemberi pakan terjadwal)
  4. Full-Spectrum LED Grow Light (Pencahayaan fotosintesis indoor)

---

## 📂 Struktur Monorepo (Moonrepo)

Proyek dikelola menggunakan arsitektur monorepo modern dengan **Moonrepo**:

```
urbangrow-workspace/
├── .moon/                     # Konfigurasi workspace Moonrepo v2
├── .agents/                   # Standar AI agent coding, aturan, & 28 skill spesialis
│   ├── skills/                # Backend, Hardware, AI, Mobile, DevOps, Taste, UI
│   └── USESKILL.md            # Matriks & panduan alur kerja skill
├── docs/                      # Naskah proposal karya ilmiah & blueprint
│   ├── proposal.docx          # Dokumen proposal penelitian lengkap
│   └── extracted_proposal.txt # Teks ekstraksi isi proposal
├── apps/
│   ├── web/                   # Frontend Dashboard (Next.js 16, Tailwind CSS v4)
│   └── mobile/                # Mobile Control Center (Flutter 3.x, Riverpod)
└── services/
    ├── backend/               # Core API & Telemetry Stream (ElysiaJS, Bun, Drizzle ORM)
    └── ai-engine/             # Predictive ML Analytics (Python 3.11, FastAPI, XGBoost)
```

---

## 🚀 Panduan Menjalankan Sistem (Getting Started)

### Prasyarat
- [Bun](https://bun.sh) (v1.2+)
- [Moonrepo CLI](https://moonrepo.dev) (`npm install -g @moonrepo/cli` atau via scoop/brew)
- [Python 3.11+](https://www.python.org/) *(untuk AI Engine)*
- [Flutter SDK](https://flutter.dev/) *(untuk Mobile App)*

### 1. Menjalankan Backend ElysiaJS
```bash
moon run backend:dev
# Berjalan di: http://localhost:3000
```

### 2. Menjalankan Dashboard Web Next.js
```bash
moon run web:dev
# Berjalan di: http://localhost:3001
```

### 3. Menjalankan Semua Layanan Sekaligus
```bash
moon run :dev
```

---

## 📊 Modul Tampilan Dashboard Web

1. **Ecosystem Overview**: Kartu metrik live pH air, suhu air/udara, kepekatan nutrisi TDS, dissolved oxygen, intensitas grow light, dan status tandon air.
2. **Smart Aquaponics Control Center**: Saklar kontrol relay 4 aktuator (pompa, aerator, lampu grow light, pompa buffer pH) dengan respon telemetri langsung.
3. **Telemetry Timeline Chart**: Grafik deret waktu interaktif multi-metrik berbasis SVG dengan area gradient dan filter kategori.
4. **Simulation Stress Testing**: Panel injeksi kondisi anomali (*Normal Condition*, *Drop pH 5.8*, *Heatwave 30°C*, *TDS Spike*) untuk menguji kesiapan sistem peringatan dini (*early warning*).

---

## 📜 Lisensi & Hak Cipta
Hak Cipta © 2026 **Regu Mawar — SMK Telkom Sidoarjo**. Dikembangkan untuk penelitian dan implementasi sistem pangan perkotaan adaptif terhadap perubahan iklim.

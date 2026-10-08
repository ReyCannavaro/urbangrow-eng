# Design System: UrbanGrow (Pine Executive & Clean Botanical)

> **Visual Reference**: Modern Clean Pine Bento & Executive Botanical Console (Inspired by Donezo Aesthetic)  
> **Target Platforms**: `apps/web` (Next.js 16 + Tailwind CSS) & `apps/mobile` (Flutter 3.x)  
> **Philosophy**: Evidence-Based Climate Adaptive Design (ECAD) • Precision Agro-Tech • Calm Scandinavian Greenery  

---

## 1. Visual Theme & Atmosphere

- **Atmosphere Rating**:
  - **Density**: `5/10` (Executive Balanced — breathable white cards, generous margins, crystal-clear hierarchy)
  - **Variance**: `7/10` (Asymmetric Bento Anchor — one primary inverted deep-green hero card anchors three crisp white metric cards)
  - **Motion**: `6/10` (Tactile Spring Physics — 200–250ms ease-out transitions, subtle haptics, digital counter animations)

- **Design Philosophy**:
  UrbanGrow beralih ke estetika **Pine Executive & Clean Botanical**:
  - **Dominasi Permukaan Bersih**: Kanvas dasar berwarna putih salju (*Pure White*) dan abu-abu lembut (*Soft Grey Canvas*) yang sangat higienis, profesional, dan modern.
  - **The Pine Anchor (Focal Point)**: Aksen utama bukan lagi kuning mentega, melainkan **Deep Forest Pine (`#165B39`)** yang kaya, berwibawa, dan merepresentasikan klorofil alami tanaman serta ketahanan pangan organik.
  - **Contrast Inversion Card**: Menggunakan 1 kartu utama bermotif hijau pekat (*Inverted Dark Green Card*) di antara kartu-kartu putih untuk menciptakan *anchor point* visual yang langsung menarik pandangan mata juri/pengguna.
  - **Texture & Graphic Precision**: Menggunakan motif garis arsir diagonal (*diagonal hatching*) untuk indikator pending/standby, serta *dark wavy ribbon texture* pada instrumen waktu dan hardware edge.

---

## 2. Color Palette & Semantic Roles

### 2.1 Surfaces & Neutrals
| Token Name | Hex Code | Functional Role & Application |
|---|---|---|
| **Outer Viewport Canvas** | `#F0F2F5` | Background luar viewport / desk frame pembungkus |
| **Console Canvas** | `#F8F9FA` | Kanvas scaffold aplikasi (ultra-clean, terang, higienis) |
| **Pure Card Surface** | `#FFFFFF` | Background kartu utama, dialog, dan container metrik |
| **Subtle Card Tint** | `#F1F5F9` | Background pill pencarian, track progress, dan badge netral |
| **Text Primary (Ink)** | `#111827` | Tipografi judul display, nilai metrik besar, teks berbobot |
| **Text Secondary** | `#4B5563` | Subtitle, label deskriptif, nama parameter, caption |
| **Text Muted** | `#9CA3AF` | Timestamp, unit teknis, shortcut keyboard, meta informasi |
| **Border Hairline** | `#E5E7EB` | Border kartu 1px halus, divider, outline tombol sekunder |

### 2.2 The Pine Botanical System (Core Accents)
| Token Name | Hex Code | Semantic Meaning & Usage |
|---|---|---|
| **Deep Forest Pine** *(Primary)* | `#165B39` | **Aksen Utama**: Hero Card Inverted, tombol CTA utama, judul reminder, brand mark |
| **Pine Dark Elevated** | `#0F3F27` | Background panel instrumen waktu & hardware edge, hover state CTA |
| **Sage Mint** *(Highlight)* | `#4EAB7C` | Bar chart aktif, progress arc, badge "Increased", indikator live |
| **Mint Wash Tint** | `#DCFCE7` | Background badge status "Optimal / Sehat", pill notifikasi |
| **Mint Text Accent** | `#166534` | Teks di dalam badge hijau muda |

### 2.3 Semantic Biological & Telemetry Status
| Token Name | Hex Code | Status Mapping |
|---|---|---|
| **Status Optimal (Completed)** | `#166534` (Bg: `#DCFCE7`) | Parameter dalam rentang ideal, panen selesai, relay ON normal |
| **Status In-Progress / Buffer** | `#B45309` (Bg: `#FEF3C7`) | Aerator aktif, proses nitrifikasi berjalan, siklus pompa |
| **Status Alert / Stop** | `#E11D48` (Bg: `#FFE4E6`) | Anomali suhu tinggi, pH asam, tombol darurat kill-switch / stop |
| **Accent Bio Cyan** | `#0284C7` (Bg: `#E0F2FE`) | Kolam Nila L3, sirkulasi DO, sensor air terlarut |
| **Accent Hydroton Amber** | `#D97706` (Bg: `#FEF3C7`) | Biofilter Kangkung L2, konversi amonia, nutrisi TDS |

---

## 3. Typography Architecture

### 3.1 Font Stacks
- **Headings & Numbers**: `Plus Jakarta Sans`, `Inter`, atau `Outfit` (Geometris bersih, modern, sans-serif)
- **Technical Readouts**: `Geist Mono` atau System Monospace dengan **`tabular-nums`** aktif untuk angka sensor dan jam digital

### 3.2 Scale & Hierarchy
| Level | Ukuran / Weight | Tracking | Aplikasi |
|---|---|---|---|
| **Display Title** | `28px – 32px` (Bold / 700) | `-0.025em` | *"Dashboard"*, *"Menara Kaskade"* |
| **Big Number KPI** | `32px – 36px` (Bold / 700) | `-0.03em` | Nilai metrik utama: `24`, `10`, `94%`, `01:24:08` |
| **Card Heading** | `15px – 16px` (SemiBold / 600) | `-0.01em` | Judul card: *"Total Projects"*, *"Project Analytics"* |
| **Body Standard** | `13px – 14px` (Regular / 400) | `normal` | Subtitle, detail event, nama anggota tim |
| **Micro Label / Badge** | `10px – 11px` (Bold / 600) | `+0.04em` | Label tab, status tag: `Completed`, `In Progress`, `CYCLE 1.5s` |

---

## 4. Component Stylings (Deconstructed from Reference)

### 4.1 Header Bar & Search Bar
- **Search Input**: Full-pill input (`rounded-full`) berlatar `#F8F9FA` dengan border `#E5E7EB`. Dilengkapi icon kaca pembesar dan keyboard shortcut pill (`⌘ F` / `Ctrl F`).
- **Utility Buttons**: Tombol sirkular (`w-10 h-10 rounded-full border border-[#E5E7EB] bg-white`) untuk Notifikasi (Bell) dan Pesan (Mail).
- **Profile Pill**: Avatar sirkular 36px + Nama tebal (`Totok Michael`) + Email muted di baris bawah.

### 4.2 Bento KPI Metric Cards (Row 1)
- **Dimensi**: 4 kolom berjejer harmonis (Web) / 2x2 grid atau carousel (Mobile).
- **Corner Radius**: `rounded-[24px]`.
- **Card Action**: Di pojok kanan atas selalu ada tombol sirkular putih (`w-8 h-8 rounded-full`) berisi ikon panah serong (`↗`).
- **The Inverted Hero Card**:
  - Background: Solid **Deep Forest Pine (`#165B39`)** dengan teks putih.
  - Angka metrik display putih besar (`24`).
  - Badge bawah: Pill hijau transparan dengan ikon tren naik: *"Increased from last month"*.
- **The 3 Standard Metric Cards**:
  - Background: Pure White (`#FFFFFF`) dengan border hairline halus (`#E5E7EB`).
  - Angka metrik display hitam pekat (`10`, `12`, `2`).
  - Badge bawah: Pill status hijau muda (*"Increased from last month"*) atau abu-abu (*"On Discuss"*).

### 4.3 Analytics Capsule Bar Chart (Row 2, Card 1)
- **Bentuk**: Tiang kapsul vertikal (`rounded-full`) untuk 7 hari (`S M T W T F S`).
- **Dual Visual State**:
  - **Active / Peak Days**: Diisi warna **Deep Forest Pine (`#165B39`)** solid atau **Sage Mint (`#4EAB7C`)**.
  - **Inactive / Off Days**: Diisi **Motif Arsir Garis Diagonal (45° Diagonal Hatching)** bergaris abu-abu transparan.
  - **Hover / Highlight**: Tooltip persentase pill mengambang di atas bar aktif (`74%`).

### 4.4 Reminders & Action Card (Row 2, Card 2)
- Card putih berisi event/tugas terjadwal.
- Judul acara menggunakan warna Deep Forest Pine (`#165B39`) tebal.
- Tombol aksi utama: **Full Pill Deep Forest Pine Button** (`+ Start Meeting` atau `Beri Pakan Ikan`) dengan ikon putih dan teks tebal.

### 4.5 Task / Project List (Row 2, Card 3)
- Card vertikal berisi daftar item dengan icon unik multi-warna (blue code, teal globe, orange speed, purple test).
- Setiap item memiliki judul tebal, due date muted, dan layout berbaris rapi dengan border divider halus.

### 4.6 Team Collaboration / Biological Pairs (Row 3, Card 1)
- Daftar entitas dengan avatar sirkular (3D Memoji / Ikon Spesies Ikan & Tanaman).
- Metadata: Nama entitas + sub-tugas aktif (*"Working on Github Project Repository"*).
- Status Pills di sisi kanan:
  - `Completed`: Background `#DCFCE7`, teks `#166534`.
  - `In Progress`: Background `#FEF3C7`, teks `#B45309`.
  - `Pending`: Background `#FFE4E6`, teks `#E11D48`.

### 4.7 Semicircular Donut Progress Gauge (Row 3, Card 2)
- Gauge setengah lingkaran bertingkat (Semicircular Donut):
  - Bagian luar: Hijau tua (*Completed*), hijau sage (*In Progress*), garis arsir (*Pending*).
  - Pusat gauge: Angka persentase besar **`41%`** + label *"Project Ended"*.
  - Legend di bawah dengan 3 titik penanda warna.

### 4.8 Dark Wave Time Tracker / IoT Edge Hardware Panel (Row 3, Card 3)
- Background: **Deep Pine Dark (`#0B2C1B`)** dengan tekstur grafis pita bergelombang 3D (*fluid 3D wavy ribbon gradient*).
- Jam Digital: Format monospace besar tebal **`01:24:08`** berwarna putih bersih.
- Tombol Kontrol:
  - Pause: Tombol bulat putih dengan icon pause hitam.
  - Stop / Reset: Tombol bulat merah menyala (`#E11D48`) dengan icon kotak putih.

---

## 5. Pemetaan ke Ekosistem UrbanGrow Smart Aquaponics

Bagaimana komponen acuan visual di atas diterjemahkan ke fungsi teknis UrbanGrow:

| Komponen Reference (Donezo) | Implementasi di UrbanGrow Web & Mobile |
|---|---|
| **Inverted Card: "Total Projects 24"** | **"Skor Kualitas Air (WQI) 94%"** atau **"Menara Kaskade 4-Level"** (Card hijau pekat premium dengan badge *"Biologis 100% Seimbang"*). |
| **Card 2: "Ended Projects 10"** | **"Suhu Air 25.4°C"** (Card putih + badge *"Stabil di rentang ideal 24-28°C"*). |
| **Card 3: "Running Projects 12"** | **"Oksigen Terlarut (DO) 7.42 mg/L"** (Card putih + badge *"Kaya oksigen untuk Nila"*). |
| **Card 4: "Pending Project 2"** | **"Kadar pH 6.98"** (Card putih + badge *"Buffer optimal 6.5 - 7.5"*). |
| **Capsule Bar Chart (S M T W T F S)** | **Grafik Stabilitas Siklus Mingguan**: Bar arsir diagonal (siklus istirahat) vs bar Deep Forest Pine (laju fotosintesis aktif) + tooltip `7.02 pH`. |
| **Reminders Card ("Meeting with Arc")** | **Jadwal Otomasi Pakan & Aerasi**: *"Pemberian Pakan Siang (35g)"* + tombol pill hijau **`+ Beri Pakan Sekarang`**. |
| **Team Collaboration Card** | **Pasangan Biologis Ekosistem (ECAD)**: L4 Pakcoy, L3 Nila, L2 Kangkung, L1 Lele lengkap dengan status pill `Sehat`, `Aktif`, `Sirkulasi`. |
| **Semicircular Donut ("41% Progress")** | **Indikator Efisiensi Konversi Amonia ke Nitrat**: Semicircular Donut `96.4%` biofilter efficiency. |
| **Time Tracker Dark Ribbon Card** | **IoT Edge Node & Wattage Runtime**: Panel hijau gelap bertekstur gelombang air + Jam runtime pompa & watt counter `45 Watt Aktif`. |

---

## 6. Layout & Spatial Grid

- **Canvas Frame**: Max width `1440px` terpusat dengan padding `24px–32px`.
- **Card Spacing**: Grid gap konsisten `16px–20px`.
- **Border Radius Hierarchy**:
  - Container Luar: `rounded-[32px]`
  - Kartu Bento: `rounded-[24px]`
  - Tombol & Pill: `rounded-full` (`9999px`)
  - Status Tag: `rounded-lg` (`8px`) atau `rounded-full`

---

## 7. Anti-Patterns (Banned AI Tells)

❌ **BANNED: AI Cyber Neon / Violet Glow**: Tidak ada warna ungu neon atau gradient cyan silau.  
❌ **BANNED: Muddy Warm Beige / Yellow Overdose**: Kanvas kembali ke putih bersih (*Pure White & Soft Cool Grey*), bukan krem kecokelatan.  
❌ **BANNED: Pure Black (`#000000`)**: Gunakan Charcoal Ink (`#111827`) atau Pine Dark (`#0B2C1B`).  
❌ **BANNED: Generic Material Outline Icons**: Gunakan rounded duo-tone atau filled modern icons yang presisi.  
❌ **BANNED: Cards Inside Cards Inside Cards**: Struktur flat bento dengan pembagian ruang tegas.

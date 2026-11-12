# UrbanGrow Design System: Pine Executive & Scandinavian Botanical Agro-Tech

> **Dokumen**: Spesifikasi Master Identitas Visual, Desain Sistem, & Panduan UI/UX  
> **Proyek**: *UrbanGrow Smart Aquaponic Berbasis IoT & Predictive AI untuk Sistem Pangan Perkotaan Adaptif terhadap Perubahan Iklim*  
> **Status**: Production Reference Standard (Web Dashboard & Mobile Alignment)  
> **Lokasi File**: `docs/DESIGN.md`

---

## 🧭 1. Filosofi Desain & Suasana Visual (Atmosphere)

UrbanGrow mengusung tema **"Pine Executive & Scandinavian Botanical Agro-Tech"**, sebuah estetika hibrida yang memadukan kedalaman fungsional dasbor eksekutif kontemporer (terinspirasi dari Donezo Executive System) dengan ketenangan alamiah teknologi pertanian presisi Nordik (*Nordic Clean Agro-Tech*).

### Karakteristik Utama:
- **Calm, High-Agency, & Non-Slop**: Menghindari klise visual "AI slop" — dilarang menggunakan neon ungu/cyan glow, gradien murahan, shadow blur berlebih, serta teks dekoratif yang tidak bermakna.
- **Utilitarian & Taktil**: Setiap kartu, tombol saklar, dan indikator telemetri dirancang memiliki bobot fisik nyata (*tactile push states*, hairline borders, dan radius sudut kurva lembut).
- **Densitas Seimbang (Balanced Density)**: Memadukan metrik kuantitatif berdensitas tinggi (*tabular-nums*, label teknis ringkas) dengan whitespace yang cukup agar operator tidak mengalami kelelahan visual (*dashboard cognitive fatigue*).

---

## 🎨 2. Palet Warna & Semantic Tokens

Sistem warna UrbanGrow dibangun di atas kanvas netral monokromatik sejuk, dipadukan dengan **Satu Warna Aksen Tunggal (Single Primary Accent)** yakni *Pine Botanical Green* (saturasi terkontrol di bawah 70%).

### 2.1. Kanvas & Permukaan (Surfaces)

| Token CSS | Kode HEX / Nilai | Peran & Penggunaan |
|---|---|---|
| `--bg-viewport` | `#F0F2F5` | Latar belakang terluar viewport (Cool Executive Grey Wash). |
| `--bg-canvas` | `#F8F9FA` | Kanvas kerja area konten utama di dalam shell aplikasi. |
| `--bg-card` | `#FFFFFF` | Permukaan kartu utama, modul metrik, panel kontrol, dan dialog modal. |
| `--bg-card-subtle` | `#F1F5F9` | Latar selang-seling, badge penampung, atau kontainer input pencarian. |
| Surface Inactive | `#FAFAFA` | Status hardware belum terpasang (*development mode*). |

---

### 2.2. Sistem Hijau Botani (Pine Botanical Accent)

| Token CSS | Kode HEX / Nilai | Peran & Penggunaan |
|---|---|---|
| `--pine-primary` | `#165B39` | **Warna Brand Utama**: Tombol primer, kartu hero anchor WQI, icon aktif, dan logo. |
| `--pine-primary-hover` | `#124B2E` | State hover tombol primer dan kartu navigasi aktif. |
| Inverted Hero Accent | `#145233` | Background hover state pada kartu hero kualitas air WQI. |
| `--pine-dark-elevated`| `#0B2C1B` | Gradien aksen untuk time tracker & panel companion mobile. |
| `--sage-mint` | `#4EAB7C` | Warna garis aksen pada chart, visualisasi ring radial, dan kurva telemetri. |
| `--sage-mint-light` | `#68C194` | Indikator live status hardware pada kartu hero dan sensor status pill. |
| `--mint-wash` | `#DCFCE7` | Background badge status optimal, pill aktif, dan seleksi menu sidebar. |
| `--mint-text` | `#166534` | Warna teks berbobot kontras tinggi di atas latar `--mint-wash`. |

---

### 2.3. Status Semantik & Indikator Peringatan (Semantic Alerts)

| Status | Background | Border | Teks | Dot / Icon | Indikasi Akuaponik |
|---|---|---|---|---|---|
| **Optimal / Normal** | `#DCFCE7` | `#BBF7D0` | `#166534` | `#10B981` | Parameter stabil (pH 6.5–7.5, Suhu 24–27°C, Relay ON). |
| **Peringatan (Warning)** | `#FEF3C7` | `#FDE68A` | `#B45309` | `#F59E0B` | Fluktuasi ringan (Suhu air 27.5°C, Cahaya redup <300 lux). |
| **Kritis (Critical)** | `#FFE4E6` / `#FEE2E2` | `#FECDD3` | `#E11D48` / `#B91C1C` | `#EF4444` | Bahaya biota (pH <6.0, Air surut, Suhu >32°C). |
| **Offline / Inactive** | `#F3F4F6` | `#E5E7EB` | `#6B7280` | `#9CA3AF` | Sensor/alat belum tersambung fisik atau menunggu data. |

---

### 2.4. Border & Hairlines

| Token CSS | Kode HEX / Nilai | Peran |
|---|---|---|
| `--border-hairline` | `#E5E7EB` | Border standar 1px solid pada semua kartu putih, pemisah tabel, dan input. |
| Border Subdued | `#F3F4F6` | Garis pemisah internal (*hairline divider*) antar-kolom metrik. |
| Border Hover | `#D1D5DB` | State hover kartu interaktif agar memberikan respon sentuhan visual. |
| Border Pine Accent | `rgba(22, 91, 57, 0.5)` | Border kartu aktuator yang sedang beroperasi aktif secara fisik. |

---

### 2.5. Hirarki Teks (Typography Colors)

| Token CSS | Kode HEX / Nilai | Peran |
|---|---|---|
| `--text-primary` | `#111827` | Charcoal Ink (Gray-900) — Judul, angka telemetri display, label utama. Dilarang memakai `#000000` pekat. |
| `--text-secondary` | `#4B5563` | Slate Grey (Gray-600) — Deskripsi, subjudul penjelasan teknis, dan label sekunder. |
| `--text-muted` | `#9CA3AF` | Muted Grey (Gray-400) — Header section kategori, unit satuan (°C, ppm), placeholder. |
| `--text-inverse` | `#FFFFFF` | Teks putih murni pada kartu inverted hero hijau atau background gelap. |

---

## 🔤 3. Arsitektur Tipografi

Sistem tipografi menggunakan kombinasi modern **Geist Sans** (antarmuka presisi) dan **Geist Mono** (data telemetri waktu nyata, register hardware, dan cap waktu).

### 3.1. Font Stack
```css
/* Sans-Serif Antarmuka */
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif;

/* Monospace Telemetri & Hardware */
font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### 3.2. Skala Tipografi & Penerapan

| Level | Ukuran & Bobot | Tracking | Karakteristik & Penggunaan |
|---|---|---|---|
| **Display Metric** | `36px` / `2.25rem` (Bold 700) | `-0.025em` | Angka sensor utama (WQI `85%`, pH `7.15`, Suhu `25.4°C`). Wajib memakai class `.num-tabular`. |
| **Page Header** | `24px` / `1.5rem` (Bold 700) | `-0.02em` | Judul halaman utama ("Dashboard Ekosistem", "Kontrol Relay Aktuator"). |
| **Section Header** | `16px`–`18px` (Bold 700) | `-0.015em` | Subjudul seksi kartu atau header tabel analitik. |
| **Card Title** | `12px` / `0.75rem` (Semibold 600) | `-0.01em` | Label kartu individual ("Suhu Air Kolam", "Kondisi Pompa Sirkulasi"). |
| **Body Standard** | `12px`–`13px` (Regular 400 / Medium 500) | `normal` | Paragraf penjelasan, interlock safety rules, dan bubble chat AgriBot. Max 65 karakter per baris. |
| **Eyebrow / Category** | `10px` (Bold 700) | `+0.05em` | Kategori navigasi ("MENU UTAMA", "SISTEM", "REGISTER I/O"). Wajib huruf kapital (`uppercase`). |
| **Technical Chip** | `9px`–`11px` (Mono Medium / Bold) | `normal` | Chip pin hardware (`GPIO 14`), status sinkronisasi (`Sync: 3.5s`), dan WiFi RSSI (`-58 dBm`). |

### 3.3. Angka Tabular (Tabular Numbers)
Seluruh metrik numerik yang berfluktuasi secara real-time wajib menggunakan styling tabular untuk mencegah pergeseran layout (*layout jitter*):
```css
.num-tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" on;
}
```

---

## 🧱 4. Sistem Komponen & Dimensi Layout

### 4.1. Hirarki Radius Sudut (Border Radius)
UrbanGrow mengadopsi kurva sudut yang tegas namun lembut, memberikan sentuhan modern ramah perangkat keras:
- **Container / App Shell**: `rounded-[28px]` s/d `rounded-[32px]` (28–32px).
- **Modul Kartu Utama (Metric & Controls)**: `rounded-[24px]` (24px) — *Signature standard radius*.
- **Sub-kartu & Drawer Modal**: `rounded-2xl` (16px).
- **Avatar & Icon Badges**: `rounded-xl` (12px).
- **Pill Tags, Badges, & Action Buttons**: `rounded-full` (9999px).

---

### 4.2. Karakteristik Komponen Inti

#### A. Inverted Hero Anchor Card (Kualitas Air WQI)
- **Tampilan**: Latar penuh `#165B39`, teks putih.
- **Tinggi Konsisten**: `164px`.
- **Elemen Navigasi**: Lingkaran putih di pojok kanan atas berdiameter `32px` (`h-8 w-8 rounded-full bg-white`) yang memuat icon panah `ArrowUpRight` hijau, berputar 45° saat hover.
- **Badge Status**: Kapsul transparan putih `bg-white/15` memuat titik hijau `#68C194` dan status telemetri hardware.

#### B. Telemetry Metric Card (Sensor Standar)
- **Tampilan**: Latar putih `#FFFFFF`, border `#E5E7EB`, padding `20px` (`p-5`).
- **Tinggi Konsisten**: `164px` (sejajar dengan Hero Card).
- **Visual Feedback**: Hover menaikkan border ke `#D1D5DB` dan latar ke `#F9FAFB`.

#### C. Studio Hardware Telemetry Strip (Connectivity Banner)
- **Struktur**: Banner berbentuk kapsul memanjang (*rail strip*), border `#E5E7EB`, latar `#F9FAFB`.
- **Elemen**:
  - Titik indikator hijau hidup (*pulsing green dot*).
  - Chip perangkat monospaced: `ESP32-GROW-01`.
  - Garis pembatas vertikal tipis `h-3.5 w-px bg-[#E5E7EB]`.
  - Teks status teknis ringkas: `4/4 sensor fisik live • Relay Aktif via HTTPS`.
  - Parameter link latensi & timestamp pembaruan terakhir.

#### D. Relay Actuator Switch Card
- **Tampilan**: Modul saklar interaktif dengan badge icon kategori (`Waves`, `Wind`, `Sun`, `Utensils`).
- **Dimensi**: Minimum tinggi `150px`, padding `20px`.
- **Saklar Taktil (Toggle Switch)**:
  - Trek saklar berukuran `44px × 24px` (`w-11 h-6 rounded-full`).
  - Posisi ON: Latar hijau `#165B39`, knob putih bergeser ke kanan (`translate-x-5`).
  - Posisi OFF: Latar abu-abu `#E5E7EB`, knob putih berada di kiri (`translate-x-1`).
- **Chip Hardware Status**:
  - Terpasang: `bg-emerald-50 text-emerald-700 border-emerald-200` (`Terpasang Fisik (GPIO 14)`).
  - Pengembangan: `bg-amber-50 text-amber-700 border-amber-200` (`Tahap Pengembangan`).

#### E. Floating Toast Notification (Auto-Dismiss)
- **Bentuk**: Floating pill card putih di pojok kanan bawah (`bottom-5 right-5`), sudut `rounded-2xl`, border `#E5E7EB`, shadow lembut `shadow-lg`.
- **Indikator**: Badge status icon di sebelah kiri (Centang hijau untuk sukses, segitiga amber untuk warning).
- **Progres Bar**: Garis tipis setinggi 2px di bagian bawah kartu dengan animasi menyusut (`animate-toast-shrink 5000ms linear forwards`) untuk memberi tanda sisa durasi tampilan sebelum ditutup otomatis.

#### F. Chat Window AgriBot AI
- **Header**: Minimalis dengan status model AI (`gemini-2.5-flash`), latensi inferensi, dan tombol reset obrolan.
- **Pesan Pengguna**: Gelembung hijau botani `#165B39`, teks putih, sudut melengkung `rounded-2xl` dengan lekukan sudut kanan bawah.
- **Pesan Asisten (AgriBot)**: Kartu putih bersih bergaris tipis, daftar analisis terstruktur tanpa markdown bocor (dilarang menampilkan tanda pagar raw `###` atau `####`), dan pill telemetri langsung (*live context strip*).

---

## 📐 5. Tata Letak (Layout) & Grid Responsif

### 5.1. Grid Shell Dashboard
```
+-----------------------------------------------------------------------------------+
|  VIEWPORT: --bg-viewport (#F0F2F5) | Padding: clamp(10px, 2dvh, 24px) clamp(12px, 1.8vw, 24px) |
|  +---------------------+  +------------------------------------------------------+  |
|  | APP SIDEBAR PANEL   |  | APP CONTENT CANVAS: --bg-canvas (#F8F9FA)            |  |
|  | - Sticky Desktop    |  | - Command Palette Header & Status Bar                |  |
|  | - Width: 208-252px  |  | - Hero Section / Studio Telemetry Rail               |  |
|  | - Rounded: 28px     |  | - Bento Metric Grid (3 Kolom Desktop / 1 Kolom HP)   |  |
|  | - Logo UrbanGrow    |  | - Visualizer Menara Kaskade & Analitik Time-Series   |  |
|  | - Nav Utama & Mobile|  | - Safety Interlock Panel & Kontrol Manual            |  |
|  +---------------------+  +------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 5.2. Aturan Kolaps Responsif (Breakpoints)
- **Desktop (≥ 1024px)**: Sidebar terkunci vertikal (*sticky non-scrollable*), grid metrik 3 kolom sejajar, tinggi konten terkendali tanpa scroll ganda.
- **Tablet (768px – 1023px)**: Grid metrik beralih ke 2 kolom, sidebar bertransformasi menjadi navigasi ringkas atas atau drawer samping.
- **Mobile (< 768px)**:
  - Multi-kolom runtuh menjadi 1 kolom penuh (*single-column stack*).
  - Margin dan padding mengecil secara proporsional.
  - Sidebar diakses melalui burger menu geser (*MobileSidebarDrawer*).
  - Dilarang keras memicu overflow horizontal (*horizontal scroll banned*).

---

## ✨ 6. Filosofi Gerak & Tekstur Khusus (Motion & Texture)

### 6.1. Tekstur Khas UrbanGrow
1. **45° Diagonal Hatched Texture (`.bg-hatched-diagonal`)**:
   - Garis-garis diagonal 45 derajat halus dengan interval 4px.
   - Digunakan pada area kapasitas inaktif, pengukur level air belum terisi, dan indikator progres.
2. **Dark Fluid Wavy Ribbon (`.bg-wavy-ribbon`)**:
   - Pola gelombang konsentris halus pada latar belakang kartu mobile companion dan time-tracker.
   - Menggunakan gradien radial `radial-gradient(circle at 100% 0%, #175C3B, #0B2C1B, #061C11)`.

### 6.2. Animasi GPU-Composited (Zero-Jitter)
- **Entrance Animation (`.ug-enter`)**:
  - `animation: ugFadeSlideUp 520ms cubic-bezier(0.22, 1, 0.36, 1) both;`
  - Menggerakkan elemen naik 14px dengan transisi opasitas yang sangat halus.
- **Chart Reveal (`.ug-chart-reveal`)**:
  - `animation: ugChartRevealX 780ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;`
  - Mengungkap grafik garis menggunakan `clip-path: inset(0 0 0 0)` dari kiri ke kanan.
- **Aksesibilitas Reduced Motion**:
  - Jika pengguna mengaktifkan mode `prefers-reduced-motion: reduce`, seluruh animasi dinonaktifkan (`animation: none !important`) demi kenyamanan.

---

## 🚫 7. Aturan Anti-Slop (Banned AI Patterns)

Untuk memastikan UrbanGrow tetap menjadi produk perangkat lunak kelas industri yang profesional dan dapat dipresentasikan di pameran inovasi ilmiah tanpa bias "AI generik", aturan berikut **WAJIB DIPATUHI**:

1. ❌ **Dilarang Emoji Anak-Anak**: Jangan pernah menaruh emoji (🌱, 🐟, 🚀, 💡, 🔥, ✨) di dalam label kartu atau judul halaman dashboard. Gunakan icon SVG monokromatik dari paket **Lucide React**.
2. ❌ **Dilarang Neon / Glow Gradient**: Dilarang menggunakan shadow bercahaya neon (`shadow-[0_0_20px_#a855f7]`) atau gradien ungu/biru futuristik murahan khas AI.
3. ❌ **Dilarang Menampilkan Raw Markdown Hash**: Respons asisten AI atau teks dashboard tidak boleh membocorkan tanda pagar (`###`, `####`). Semua format heading wajib dirender menjadi HTML terstruktur (`h3`, `h4`) dengan tipografi bersih.
4. ❌ **Dilarang Menggunakan Hitam Pekat `#000000`**: Selalu gunakan warna tinta arang (*Charcoal Ink*) `#111827` untuk teks dan kontras tinggi.
5. ❌ **Dilarang Angka Bulat Palsu**: Hindari statistik palsu buatan AI (misal: "Akurasi 99.9%", "Efisiensi 50.0%"). Tampilkan angka nyata hasil komputasi sensor (misal: "WQI 84%", "TDS 580 ppm", "pH 7.15").
6. ❌ **Dilarang Teks Klise AI / Fluff Copywriting**: Dilarang menggunakan kata-kata hampa seperti *"Elevate your smart farming"*, *"Next-gen seamless solution"*, *"Unleash the power of IoT"*. Gunakan bahasa teknis objektif dan ringkas (misal: *"Sirkulasi air kolam menuju talang vertikal pakcoy aktif"*).
7. ❌ **Dilarang Tumpukan Kartu Tanpa Makna**: Jangan membuat "kartu di dalam kartu di dalam kartu". Setiap kartu harus memiliki alasan fungsional yang jelas.

---

## 📱 8. Keselarasan Mobile (Flutter Alignment)

Desain sistem di atas dijadikan referensi langsung saat mengembangkan antarmuka aplikasi mobile Flutter (`apps/mobile`):
- **Primary Green**: `Color(0xFF165B39)`
- **Background Canvas**: `Color(0xFFF0F2F5)`
- **Card Surface**: `Color(0xFFFFFFFF)`
- **Text Charcoal**: `Color(0xFF111827)`
- **Card Corner Radius**: `BorderRadius.circular(24.0)`
- **Font**: Google Fonts `Geist` & `Geist Mono`
- **Elevasi**: `elevation: 0` dengan `border: Border.all(color: Color(0xFFE5E7EB))`

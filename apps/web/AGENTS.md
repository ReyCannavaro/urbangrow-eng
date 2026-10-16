<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 💻 UrbanGrow Web Dashboard Frontend Agent Specification (`apps/web`)

> **Aplikasi**: Web Decision Support & Telemetry Dashboard  
> **Teknologi**: Next.js 16.3.5 (App Router), React 19.2.8, Tailwind CSS v4, Lucide React, Bun Runtime  
> **Port Default**: `3001` (dijalankan via `moon run web:dev`)

---

## 🎨 1. Desain Sistem & Estetika (Dark-Tech Glassmorphism)

UrbanGrow Web dirancang dengan standar visual agensi kelas atas (*Anti-Generic, Premium Dark Mode*):

1. **Palet Warna Curated**:
   - Background Utama: `slate-950` (`#020617`) dengan radial glow `emerald-500/10` dan `cyan-500/10`.
   - Card Surfaces: `slate-900/60` dengan backdrop blur `12px` dan border `slate-800/80`.
   - Aksen Utama Ekosistem: `emerald-400` (vitalitas tanaman), `cyan-400` (hidro/akuakultur), `amber-400` (peringatan suhu/pH), `rose-500` (krisis).
2. **Tipografi**:
   - Modern monospace tabular untuk angka metrik (`font-mono`, `tabular-nums`) agar tidak bergoyang saat telemetri streaming diperbarui.
3. **No Cheap Generic Slop**:
   - Dilarang menggunakan tombol rounded-pill ungu generik. Gunakan border bercahaya halus (*subtle glow*), transition duration 200ms ease-out.

---

## 🧩 2. Arsitektur Komponen & 4 Modul Utama

```
apps/web/
├── app/
│   ├── layout.tsx         # Root layout (Metadata, Google Font, Theme Provider)
│   ├── page.tsx           # Main Dashboard Hub (Ecosystem Overview)
│   ├── history/page.tsx   # Modul 3: Historical Analytics & Time-Series Charts
│   ├── ai-insights/       # Modul 4: AI Predictive Analytics & Climate Score
│   └── controls/          # Modul 2: Actuator Relay Manual Override & Safety
├── components/
│   ├── metrics/           # 6 Sensor telemetry cards (pH, TDS, Temp, RH, Lux, DO)
│   ├── controls/          # Actuator toggle cards (Pump, Aerator, Feeder, Grow Light)
│   ├── ecosystem/         # 4-Level Modular Aquaponic Visualizer (Pakcoy->Nila->Kangkung->Lele)
│   ├── charts/            # Canvas/SVG time-series charts with rolling window
│   └── ai/                # Climate Adaptation Score gauge & Harvest countdown widget
└── lib/
    ├── api.ts             # REST client fetching from ElysiaJS (Port 3000)
    └── websocket.ts       # SSE / WebSocket telemetry hook
```

---

## ⚡ 3. Aturan Teknis React 19 & Next.js 16

1. **Server Components vs Client Components**:
   - Komponen default adalah Server Component.
   - Tambahkan direktif `'use client'` hanya pada komponen yang memiliki interaktivitas browser (chart interaktif, toggle relay, slider simulator, SSE subscriber).
2. **Data Fetching & Caching**:
   - Konsumsi REST backend menggunakan `fetch('http://localhost:3000/api/...', { next: { revalidate: 0 } })` untuk data real-time, atau polling hook 3.000 ms jika SSE terputus.
3. **Pemberitahuan Darurat (Critical Alert Banners)**:
   - Jika endpoint `/api/alerts` mengembalikan anomali kritis (misal pH < 6.0 atau DO < 4.0 mg/L), render sticky alert banner di puncak dashboard dengan indikator audio/visual berdenyut (*pulsing ping*).

---

## 🧪 4. Standar Kode & Command Verifikasi

```bash
# Menjalankan linter Next.js
bun run lint

# Membangun produksi untuk memastikan tidak ada type error
bun run build
```

# 💻 UrbanGrow Frontend Web Agent Rulebook

> **Scope**: `apps/web` (Next.js 16, React 19, Tailwind CSS v4, Lucide React)  
> **Status**: Production Standard Rulebook

---

## 🎨 1. Aturan Desain & Konsistensi UI

1. **Dark-Tech Aesthetic Guarantee**:
   - Seluruh komponen antarmuka menggunakan palet dark slate (`slate-950` base, `slate-900/60` card panels, `emerald-400` primary accent, `cyan-400` secondary accent).
   - Hindari tombol warna solid terang atau background putih polos.
2. **Tabular Numerics**:
   - Nilai telemetri sensor wajib menggunakan kelas `font-mono tabular-nums` untuk mencegah pergeseran layout (*layout shift*) saat nilai angka berganti.

---

## ⚙️ 2. Aturan Next.js 16 & React 19

1. **Hydration Mismatch Prevention**:
   - Jangan pernah membaca `Date.now()` atau `new Date()` langsung di dalam render JSX Server Component. Gunakan state client dengan `useEffect` atau format waktu dari timestamp telemetri.
2. **Server/Client Boundary**:
   - Taruh `'use client'` hanya pada level terendah komponen interaktif (misalnya tombol saklar, chart SVG, chat drawer). Wrapper halaman utama harus tetap Server Component untuk memaksimalkan SSR performance.
3. **Optimistic UI Updates**:
   - Saat pengguna menekan saklar relay aktuator, tampilkan status saklar berubah secara instan (*optimistic state*) sambil mengirimkan request POST ke `/api/actuators/:id/toggle`. Jika server gagal, revert status dengan toast peringatan.

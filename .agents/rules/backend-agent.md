# ⚡ UrbanGrow Backend API Agent Rulebook

> **Scope**: `services/backend` (ElysiaJS, Bun Runtime, TypeBox, Eden Treaty)  
> **Status**: Production Standard Rulebook

---

## 🎯 1. Struktur Rute & Error Middleware

1. **Global Error Boundary**:
   - Seluruh unhandled exceptions wajib ditangkap oleh handler `.onError(({ code, error, set }) => {...})`.
   - Format error JSON yang dikembalikan ke klien harus konsisten: `{ success: false, error: string, code: number }`.
2. **TypeBox Validation Strictness**:
   - Dilarang menggunakan tipe `any` pada input handler API. Setiap parameter, query, dan request body wajib didefinisikan dengan skema `t.Object`, `t.Numeric`, atau `t.String`.

---

## 🔗 2. Eden Treaty Zero-Drift Contract

1. **Export App Type**:
   - File utama `src/index.ts` wajib mengekspor `export type App = typeof app`.
2. **Sinkronisasi Klien Frontend**:
   - Klien web (`apps/web`) dapat mengonsumsi tipe endpoint secara langsung tanpa deklarasi interface manual, menjamin nol *drift* saat rute backend ditambah atau diubah.

---

## 🛑 3. Graceful Shutdown & Resource Cleanup

1. **SIGINT / SIGTERM Listener**:
   - Saat container dihentikan, backend wajib menutup koneksi WebSocket aktif dengan close code 1001 (Going Away) dan mematikan scheduler background sebelum proses Bun dihentikan.

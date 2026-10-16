# 📱 UrbanGrow Mobile App Agent Rulebook

> **Scope**: `apps/mobile` (Flutter 3.x, Dart 3.x, Riverpod 2.x, Material 3)  
> **Status**: Production Standard Rulebook

---

## 🏛️ 1. Hierarki Riverpod State Management

1. **Provider Scope Separation**:
   - `telemetryStreamProvider`: StreamProvider yang mendengarkan SSE/WebSocket dari backend.
   - `actuatorControllerProvider`: StateNotifierProvider yang menangani aksi mutasi relay aktuator dengan debouncing 500ms.
   - `alertsBadgeProvider`: Computed provider untuk menghitung jumlah anomali aktif.
2. **Auto-Dispose Policy**:
   - Gunakan `.autoDispose` pada provider layar detail (seperti visualisasi historis FlChart) untuk membebaskan alokasi memori grafik saat pengguna berpindah tab.

---

## 📶 2. Background Sync & Offline Resilience

1. **Local SQLite / Shared Preferences Cache**:
   - Simpan 20 titik telemetri terakhir di penyimpanan lokal agar saat aplikasi dibuka dalam kondisi offline, grafik tidak kosong melainkan menampilkan data cache terakhir beserta label "CACHED DATA".
2. **Connectivity Listener**:
   - Pantau status jaringan (Wi-Fi vs Data Seluler). Jika berpindah ke data seluler di luar jangkauan LAN lokal, arahkan endpoint API secara dinamis ke URL Cloudflare Tunnel.

# 📱 UrbanGrow Mobile App Agent Specification (`apps/mobile`)

> **Aplikasi**: Mobile Control Center & Real-time Field Telemetry  
> **Teknologi**: Flutter 3.x, Dart 3.x, Flutter Riverpod 2.x, Material 3, Dio / Http  
> **Target OS**: Android (APK) & iOS

---

## 🏗️ 1. Arsitektur State Management (Riverpod)

Aplikasi mobile UrbanGrow mengadopsi struktur berbasis fitur (*Feature-First Clean Architecture*):

```
apps/mobile/lib/
├── core/
│   ├── config/api_config.dart   # URL Gateway backend (Localhost / LAN / Cloudflare Tunnel)
│   └── theme/app_theme.dart     # Dark Emerald Eco Design System (Color tokens, Typography)
└── features/
    ├── splash/                  # Animasi inisialisasi koneksi IoT
    ├── navigation/              # MainShellScreen dengan Curved/Adaptive Navigation Bar
    ├── dashboard/               # Ringkasan telemetri, SensorGaugeCard & QuickActionsPanel
    ├── telemetry/               # Riverpod TelemetryNotifier, TelemetryModel & Polling/SSE
    ├── controls/                # ActuatorCard, toggle relay, interval safety timer
    ├── tower/                   # Visualisasi 4-Level Tower (Pakcoy, Nila, Kangkung, Lele)
    ├── analytics/               # Visualisasi grafik deret waktu FlChart
    ├── alerts/                  # AlertsModalSheet untuk notifikasi threshold darurat
    └── agribot/                 # Chat interface asisten pertanian cerdas AI
```

---

## ⚡ 2. Aturan Rekayasa Flutter & Riverpod

1. **State Immutability & Notifiers**:
   - Gunakan `StateNotifierProvider` atau `AsyncNotifierProvider` untuk memanajemen state telemetri (`telemetryNotifierProvider`).
   - Jangan pernah melakukan mutasi langsung pada objek state. Selalu gunakan `state.copyWith(...)`.
2. **Koneksi Jaringan Adaptif**:
   - `api_config.dart` harus mendukung konfigurasi URL dinamis:
     - Emulator Android: `http://10.0.2.2:3000`
     - Perangkat Fisik (Local Wi-Fi): `http://192.168.x.x:3000`
     - Cloudflare Tunnel: `https://urbangrow-api.domain.com`
   - Terapkan mekanisme auto-retry jika koneksi terputus dan tampilkan badge status "OFFLINE / RECONNECTING".
3. **UX Haptic & Micro-Animations**:
   - Berikan feedback haptic (`HapticFeedback.lightImpact()`) saat pengguna menekan tombol saklar aktuator relay.
   - Gunakan `AnimatedSwitcher` atau `Hero` transitions untuk pergantian tab visualisasi menara akuaponik.

---

## 🧪 3. Prosedur Build & Deployment APK

```bash
# Analisis kode Dart
flutter analyze

# Menjalankan unit test
flutter test

# Mengompilasi APK rilis untuk pengujian lapangan di smartphone
flutter build apk --release --split-per-abi
```

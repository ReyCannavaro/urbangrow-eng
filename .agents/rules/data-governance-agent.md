# 📐 UrbanGrow Data Governance & Calibration Standard

> **Sub-Bidang**: Sensor Health Lifecycle, Calibration Tracking & Data Provenance  
> **Status**: Production Reference Standard

---

## 🔍 1. Pelacakan Degradasi Sensor (Sensor Drift Lifecycle)

Probe pH kaca dan elektroda TDS mengalami penuaan dan biofouling alami (penumpukan lumut/alga):

1. **Jadwal Kalibrasi Berkala**:
   - Sistem menandai sensor pH wajib dikalibrasi ulang setiap 30 hari operasional.
   - Jika kalibrasi terlewat >45 hari, dashboard menampilkan ikon peringatan kuning `CALIBRATION_OVERDUE`.
2. **Kompensasi Penurunan Sensitivitas (*Slope Tracking*)**:
   - Catat nilai tegangan neutral ($V_{\text{neutral}}$) dan asam ($V_{\text{acid}}$) setiap kali pengguna melakukan kalibrasi buffer pH 4.01 dan 6.86 di database, untuk memantau kemerosotan elektroda kaca.

---

## 🏷️ 2. Provenance & Anotasi Dataset AI

1. **Labeling Siklus Tanam**:
   - Setiap deret waktu telemetri dihubungkan dengan foreign key `cycle_id` (contoh: *Kangkung-Batch-03*, *Nila-Batch-01*).
2. **Flag Data Uji vs Aktual**:
   - Telemetri yang dihasilkan oleh mode override simulator diberi flag boolean `is_synthetic: true` agar tidak mencemari dataset validasi performa riil di lapangan.

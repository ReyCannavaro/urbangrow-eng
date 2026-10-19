# ⚡ UrbanGrow Energy Management & Dual-Power Specifications

> **Target Arsitektur**: Sistem Catu Daya Adaptif Mandiri Energi (12V DC Native)  
> **Institusi**: SMK Telkom Sidoarjo (Regu Mawar)  
> **Status**: Approved Engineering Specification

---

## 🔋 1. Profil Konsumsi Daya (Power Budget Breakdown)

| Komponen Beban | Tegangan Kerja | Arus Rata-rata | Konsumsi Daya | Mode Operasi |
|---|---|---|---|---|
| **Pompa Sirkulasi 12V DC** | 12.0 V DC | 1.25 A | 15.0 Watt | Kontinu 24 Jam |
| **Dual-Port Aerator O2** | 12.0 V / 220V | 0.25 A | 3.0 Watt | Kontinu (Intermittent saat Eco) |
| **LED Full-Spectrum 4-Level**| 12.0 V DC | 1.50 A | 18.0 Watt | 12 Jam/Hari (Fotoperiode) |
| **ESP32 & Rangkaian Sensor**| 5.0 V DC | 0.18 A | 0.9 Watt | Kontinu 24 Jam |
| **Total Beban Siang Hari** | - | - | **36.9 Watt** | Maksimum Aktif |
| **Total Beban Malam Hari** | - | - | **18.9 Watt** | Lampu LED OFF |

---

## ☀️ 2. Perhitungan Kapasitas Cadangan Baterai (Blackout Resilience)

Baterai Cadangan **Sealed Lead Acid (SLA) 12V 7.0 Ah** ($84\text{ Wh}$):
- Pada saat pemadaman listrik PLN di malam hari (Lampu LED otomatis dimatikan oleh sistem):
  $$\text{Daya Kritis} = \text{Pompa (15W)} + \text{Aerator (3W)} + \text{Logika (0.9W)} = 18.9\text{ Watt}$$
  $$\text{Durasi Daya Cadangan} = \frac{84\text{ Wh} \times 0.70 \text{ (Depth of Discharge)}}{18.9\text{ W}} \approx 3.1\text{ Jam}$$
- Jika sistem masuk ke **Mode Eco Darurat** (Sirkulasi pompa diatur interval 15 menit ON / 15 menit OFF), daya cadangan mampu bertahan hingga **5.8 Jam**.

---

## ⚡ 3. Spesifikasi Solar PV & Solar Charge Controller (SCC)

- **Panel Surya (PV Module)**: 50 Wp Monocrystalline (Vmp: 18.2V, Imp: 2.75A)
- **Solar Charge Controller (SCC)**: 10A PWM / MPPT dengan proteksi Overcharge & Deep Discharge (LVD 10.8V, LVR 12.4V)
- **Estimasi Produksi Harian (Puncak Sinar Matahari 4.2 Jam)**:
  $$E_{\text{daily}} = 50\text{ Wp} \times 4.2\text{ Jam} \times 0.85\text{ (efisiensi)} \approx 178.5\text{ Wh/hari}$$
  Daya ini mencukupi untuk mengimbangi 65-75% konsumsi harian beban kritis di siang hari.

---

## 🔄 4. FSM Status Daya & Safety Cut-off (Power State Machine)

```
[Normal Grid PLN Active] ──(PLN Drop)──> [Battery Discharge Mode]
                                               │
                                       (V_batt < 11.5V)
                                               ▼
                                      [Eco-Mode Intermittent]
                                               │
                                       (V_batt < 10.8V)
                                               ▼
                                    [Critical LVD Shutdown]
                                  (Keep ESP32 Deep Sleep Beacon)
```

1. **V_batt > 12.2V**: Normal Continuous Flow, All Actuators Allowed.
2. **11.5V ≤ V_batt ≤ 12.2V**: Warning State, Grow Light Dimmed / Disabled, Aerator Continues.
3. **10.8V ≤ V_batt < 11.5V**: Eco Mode, Pump Duty Cycle 50% (15m ON / 15m OFF), Alert Dispatched.
4. **V_batt < 10.8V**: Low Voltage Disconnect (LVD), relays cut off to protect SLA battery longevity, ESP32 transmits dying gasp packet.

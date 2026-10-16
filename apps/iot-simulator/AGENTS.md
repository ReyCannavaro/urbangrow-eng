# 🧪 IoT Hardware Simulator Agent Guide (`apps/iot-simulator`)

> **Aplikasi**: Web-based Hardware & Telemetry Simulator  
> **Teknologi**: Vite + React 19 + TypeScript + Tailwind CSS  
> **Fungsi**: Mensimulasikan board ESP32, 6 sensor analog/digital, dan 4 relay aktuator untuk pengujian lokal tanpa hardware fisik.

---

## 🎯 Aturan Agen IoT Simulator

1. **State Synchronization**:
   - Seluruh perubahan slider sensor pada UI wajib memicu debounce dispatch (250 ms) ke backend melalui `POST /api/simulation/sensor-override`.
2. **Generative Anomaly Injection**:
   - Simulator harus mendukung mode injeksi anomali:
     - `ph_drop`: pH menurun drastis ke 5.2 (indikasi fermentasi limbah berlebih)
     - `heatwave`: Suhu air naik >31°C dan DO turun <4.0 mg/L
     - `tds_spike`: TDS melesat >1200 ppm (toksisitas garam mineral)
3. **Schematic Accuracy**:
   - Komponen visual skematik di `HardwareSchematic.tsx` harus secara presisi menampilkan label pin GPIO sesuai ESP32 DevKit V1 (GPIO 34 pH, GPIO 35 TDS, GPIO 4 DS18B20, GPIO 25-33 Relays).

---

## 🎛️ 4. Batasan Rentang Slider Sensor & Granularitas

| Parameter Sensor | Rentang Slider | Granularitas (Step) | Default Nominal |
|---|---|---|---|
| **pH Air** | `4.00 – 10.00` | `0.05` | `7.00` |
| **TDS Nutrisi** | `100 – 1500 ppm` | `10 ppm` | `650 ppm` |
| **Suhu Air (DS18B20)** | `15.0 – 40.0 °C` | `0.1 °C` | `25.0 °C` |
| **Suhu Udara (DHT22)** | `20.0 – 45.0 °C` | `0.1 °C` | `28.5 °C` |
| **Kelembapan Udara** | `30 – 100 %` | `1 %` | `70 %` |
| **Intensitas Cahaya (BH1750)** | `0 – 50,000 Lux` | `500 Lux` | `18,000 Lux` |
| **Dissolved Oxygen (DO)** | `1.0 – 10.0 mg/L` | `0.1 mg/L` | `6.2 mg/L` |

---

## 🌊 5. Mode Auto-Oscillation (Simulasi Fluktuasi Alami)

Simulator menyediakan saklar toggle *Auto Fluctuation* yang menerapkan fungsi sinus dengan derau acak Gaussian halus ($\pm 1.5\%$) pada parameter suhu dan cahaya untuk mensimulasikan siklus siang-malam secara realistis.

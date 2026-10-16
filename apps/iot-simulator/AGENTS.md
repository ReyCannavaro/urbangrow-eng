# 🧪 IoT Hardware Simulator Agent Guide (`apps/iot-simulator`)

> **Aplikasi**: Web-based Hardware & Telemetry Simulator  
> **Teknologi**: Vite + React 19 + TypeScript + Tailwind CSS  
> **Fungsi**: Mensimulasikan board ESP32, 6 sensor analog/digital, dan 4 relay aktuator untuk pengujian lokal tanpa hardware fisik.

---

## 🎯 Aturan Agen IoT Simulator

1. **State Synchronization**:
   - Seluruh perubahan slider sensor pada UI wajib memicu debounce dispatch ke backend melalui `POST /api/simulation/sensor-override`.
2. **Generative Anomaly Injection**:
   - Simulator harus mendukung mode injeksi anomali:
     - `ph_drop`: pH menurun drastis ke 5.2 (indikasi fermentasi limbah berlebih)
     - `heatwave`: Suhu air naik >31°C dan DO turun <4.0 mg/L
     - `tds_spike`: TDS melesat >1200 ppm (toksisitas garam mineral)
3. **Schematic Accuracy**:
   - Komponen visual skematik di `HardwareSchematic.tsx` harus secara presisi menampilkan label pin GPIO sesuai ESP32 DevKit V1 (GPIO 34 pH, GPIO 35 TDS, GPIO 4 DS18B20, GPIO 25-33 Relays).

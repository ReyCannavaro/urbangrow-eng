# ⚡ UrbanGrow IoT & Embedded Hardware Agent Specification

> **Sub-Bidang**: Internet of Things (IoT), Edge Microcontroller, Sensor Acquisition & Actuator Control  
> **Target Hardware**: ESP32 DevKit V1 (30-pin), C++/Arduino / FreeRTOS & IoT Simulator (`apps/iot-simulator`)  
> **Status**: Production Reference Standard

---

## 📌 1. Prinsip Operasional IoT Edge

1. **Stabilitas 24/7 & Fail-Safe Hardware**:
   - ESP32 beroperasi terus menerus dengan FreeRTOS multitasking.
   - Wajib mengaktifkan **Hardware Watchdog Timer (WDT)** dengan batas timeout 8.000 ms.
   - Semua relay aktuator menggunakan modul optocoupler **Active-Low**. Saat boot/reboot, pin kendali diinisialisasi `HIGH` terlebih dahulu untuk mencegah trigger sesaat (*relay chatter*).
2. **Kesesuaian Sirkuit Dual-Power (Adaptor 12V DC + Baterai 12V 7Ah)**:
   - Jalur aktuator dialiri 12V DC langsung melalui modul step-down dan fuse pengaman.
   - Jalur logika dan sensor dialiri 5V / 3.3V stabil dengan filter kapasitor decoupling.

---

## 🔌 2. Matriks Pinout ESP32 DevKit V1

| Komponen / Sensor / Aktuator | Tipe I/O | Pin ESP32 | Protokol / Karakteristik | Target Nilai Normal |
|---|---|---|---|---|
| **pH Sensor (PH-4502C)** | Input Analog | GPIO 34 (ADC1_CH6) | ADC1 Linear Voltage (0.0–3.3V) | 6.5 – 7.5 pH |
| **Analog TDS Meter** | Input Analog | GPIO 35 (ADC1_CH7) | ADC1 Voltage to PPM conversion | 400 – 800 ppm |
| **DS18B20 Waterproof** | Input Digital | GPIO 4 | Dallas OneWire (Pull-up 4.7 kΩ) | 22.0 – 27.0 °C |
| **DHT22 (Suhu & RH)** | Input Digital | GPIO 14 | Single-bus proprietary timing | 24–32°C / 60–85% RH |
| **BH1750 (Lux Meter)** | Input Digital | GPIO 21 (SDA), GPIO 22 (SCL) | I2C Standard (0x23 / 0x5C) | 15,000 – 30,000 Lux |
| **Water Level Switch** | Input Digital | GPIO 18 | Digital Pull-up (Dry contact) | HIGH (Cukup) / LOW (Surut) |
| **Relay 1: Pompa Air 12V** | Output Digital | GPIO 25 | Active-Low Relay (Sirkulasi 4 Level) | Normal ON (Sirkulasi Kontinu) |
| **Relay 2: Aerator DO O2** | Output Digital | GPIO 26 | Active-Low Relay (Injeksi Oksigen) | Auto (ON jika DO < 5.0 mg/L) |
| **Relay 3: Automatic Feeder** | Output Digital | GPIO 27 | Active-Low Relay / Servo PWM | Terjadwal (07:00 & 16:30 WIB) |
| **Relay 4: LED Grow Light** | Output Digital | GPIO 33 | Active-Low Relay (Full-Spectrum) | Terjadwal (12 Jam Fotoperiode) |

---

## 📡 3. Spesifikasi Payload Telemetri Ingestion (JSON Schema)

ESP32 mengirimkan telemetri berkala (interval 5.000 ms) ke Backend API melalui HTTP POST `/api/sensors/telemetry` atau MQTT topic `urbangrow/telemetry`:

```json
{
  "device_id": "esp32-urbangrow-01",
  "timestamp": "2026-10-16T14:20:00.000Z",
  "telemetry": {
    "ph": 6.85,
    "tds_ppm": 620,
    "water_temp_c": 24.8,
    "air_temp_c": 28.5,
    "humidity_pct": 72.0,
    "lux": 18500,
    "dissolved_oxygen_mg_l": 5.8,
    "water_level_ok": true
  },
  "actuators": {
    "pump": true,
    "aerator": true,
    "feeder": false,
    "grow_light": true
  },
  "system": {
    "wifi_rssi_dbm": -58,
    "free_heap_bytes": 184520,
    "uptime_seconds": 128450
  }
}
```

---

## 🛡️ 4. Panduan untuk AI Developer Agen IoT

- Saat mengimplementasikan driver sensor, gunakan **ADC1** untuk pembacaan analog karena ADC2 di nonaktifkan oleh radio Wi-Fi internal ESP32.
- Lakukan sampling analog sebanyak 10 kali lalu ambil **median** untuk menghilangkan lonjakan spike noise listrik.
- Di sisi simulator (`apps/iot-simulator`), pastikan state sinkron dengan endpoint `/api/simulation/sensor-override`.

# 🔌 UrbanGrow Hardware Circuit Diagram & Wiring Specifications

> **Target Controller**: ESP32 DevKit V1 (30-pin, CP2102)  
> **Power Rail**: 12V DC Primary + 12V 7Ah SLA Battery Backup  
> **Status**: Approved Hardware Schematic

---

## ⚡ 1. Topologi Distribusi Daya (Dual Power Architecture)

```
[Adaptor AC 220V -> DC 12V 5A] ──[ Dioda Schottky 10A ]──┐
                                                          ├─► Rel Daya Aktuator 12V (Pompa, LED)
[Baterai SLA 12V 7Ah Cadangan] ──[ Dioda Schottky 10A ]──┘
                                                          │
                                                [ LM2596 Step-Down ]
                                                          │
                                                          ▼
                                             Rel Daya Sensor & ESP32 5.0V / 3.3V
```

---

## 📌 2. Tabel Sambungan Pinout Lengkap

| Perangkat / Sensor | Jalur Sinyal | Pin ESP32 | Komponen Pendukung |
|---|---|---|---|
| Sensor pH (PH-4502C) | Analog Out | GPIO 34 (ADC1) | Kapasitor decoupling 100nF |
| Sensor TDS Analog | Analog Out | GPIO 35 (ADC1) | Filter low-pass RC (1kΩ, 10µF) |
| Suhu Air (DS18B20) | Data (OneWire) | GPIO 4 | Resistor Pull-up 4.7 kΩ ke 3.3V |
| Suhu Udara (DHT22) | Data | GPIO 14 | Resistor Pull-up 10 kΩ |
| Lux Meter (BH1750) | I2C SDA / SCL | GPIO 21 / 22 | Jalur I2C internal pull-up |
| Sensor Ketinggian Air | Digital Switch | GPIO 18 | Internal Pull-Up ESP32 |
| Relay 1 (Pompa 12V) | IN1 (Active Low) | GPIO 25 | Optocoupler Isolation |
| Relay 2 (Aerator O2) | IN2 (Active Low) | GPIO 26 | Optocoupler Isolation |
| Relay 3 (Auto Feeder)| IN3 (Active Low) | GPIO 27 | Optocoupler Isolation |
| Relay 4 (LED Grow) | IN4 (Active Low) | GPIO 33 | Optocoupler Isolation |

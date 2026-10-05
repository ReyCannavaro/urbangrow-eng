---
name: iot-embedded-firmware
description: Comprehensive IoT firmware and embedded engineering skill for ESP32 microcontrollers in the UrbanGrow aquaponics ecosystem. Covers C++/Arduino and MicroPython, analog-to-digital sensor calibration (pH, TDS, DS18B20, DHT22/BME280, BH1750), actuator relay control, MQTT/HTTP telemetry transmission, WiFi auto-reconnect, and hardware watchdog timers.
---

# 🔌 IoT Embedded Firmware & Sensor Calibration (ESP32)

> **Core Focus**: Production-ready, resilient firmware for **UrbanGrow Smart Aquaponics** nodes powered by **ESP32**, handling multi-sensor telemetry, ADC calibration, relay actuation, and robust edge-to-cloud communication.

---

## 🧭 1. HARDWARE ARCHITECTURE & PIN MAPPING (ESP32 DevKit V1)

Standard GPIO assignment for the UrbanGrow aquaponics monitoring node:

| Sensor / Module | Interface | GPIO Pin | Operating Voltage | Notes |
|---|---|---|---|---|
| **pH-4502C Sensor** | Analog (ADC1) | `GPIO 34` | 5V VCC, 3.3V ADC out | Input-only ADC pin, avoid ADC2 (conflicts with WiFi) |
| **Analog TDS Meter** | Analog (ADC1) | `GPIO 35` | 3.3V - 5V | Input-only ADC pin, temperature-compensated |
| **DS18B20 Water Temp**| 1-Wire (Digital) | `GPIO 4` | 3.3V or 5V | Requires 4.7kΩ pull-up resistor between Data & VCC |
| **DHT22 / BME280** | Digital / I2C | `GPIO 21 (SDA)`, `GPIO 22 (SCL)` | 3.3V | I2C preferred (BME280: temp, humidity, pressure) |
| **BH1750 Light Meter** | I2C | `GPIO 21 (SDA)`, `GPIO 22 (SCL)` | 3.3V | Address: `0x23` (ADDR pin low) |
| **Relay 1: Water Pump** | Digital Output | `GPIO 26` | Active LOW / HIGH | Optocoupler isolated relay module |
| **Relay 2: Aerator** | Digital Output | `GPIO 27` | Active LOW / HIGH | Keeps dissolved oxygen levels high |
| **Relay 3: Grow Light** | Digital Output | `GPIO 14` | Active LOW / HIGH | PWM capable for dimming schedules |
| **Relay 4: Dosing Pump**| Digital Output | `GPIO 12` | Active LOW / HIGH | Acid / Base pH buffer dosing |
| **Status LED** | Digital Output | `GPIO 2` | Onboard LED | Blinks on telemetry push, solid on WiFi loss |

> ⚠️ **CRITICAL ESP32 ADC RULE**: Never use ADC2 pins (`GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27`) for analog sensor inputs when WiFi is active. ADC2 is shared with the WiFi peripheral and will return corrupted readings. Always use **ADC1** (`GPIO 32 - 39`).

---

## 📐 2. SENSOR CALIBRATION ALGORITHMS

### 2.A pH Calibration (pH-4502C)
The pH probe produces a voltage proportional to hydrogen ion concentration. Standard two-point calibration using buffer solutions (pH 4.01 and pH 6.86 or 7.00):

```cpp
// Analog read averaging with 12-bit ADC (0 - 4095)
float readPH(int pin, float temperatureC) {
  const int SAMPLES = 20;
  int buffer[SAMPLES];
  
  for (int i = 0; i < SAMPLES; i++) {
    buffer[i] = analogRead(pin);
    delay(10);
  }
  
  // Sort and remove outliers (median filtering)
  std::sort(buffer, buffer + SAMPLES);
  long sum = 0;
  for (int i = 4; i < 16; i++) { // middle 12 samples
    sum += buffer[i];
  }
  float avgRaw = (float)sum / 12.0;
  float voltage = (avgRaw / 4095.0) * 3.3; // ESP32 3.3V reference
  
  // Calibration formula: pH = 7.0 + ((V_neutral - V_measured) * slope)
  // Calibrated values for standard module:
  const float V_PH7 = 1.65; // Voltage when probe is in pH 7.0 buffer
  const float SLOPE = 3.5;  // Calculated from 2-point buffer test
  
  float ph = 7.0 - ((voltage - V_PH7) * SLOPE);
  return constrain(ph, 0.0, 14.0);
}
```

### 2.B TDS (Total Dissolved Solids) with Temperature Compensation
TDS conductivity fluctuates ~2% per °C. Temperature compensation using the DS18B20 water temperature reading is mandatory:

```cpp
float readTDS(int pin, float waterTempC) {
  int raw = analogRead(pin);
  float voltage = (raw / 4095.0) * 3.3;
  
  // Temperature compensation coefficient (standard 25°C base)
  float tempCoefficient = 1.0 + 0.02 * (waterTempC - 25.0);
  float compensationVoltage = voltage / tempCoefficient;
  
  // Non-linear polynomial conversion from voltage to TDS (ppm)
  float tds = (133.42 * pow(compensationVoltage, 3) 
             - 255.86 * pow(compensationVoltage, 2) 
             + 857.39 * compensationVoltage) * 0.5;
             
  return max(0.0f, tds);
}
```

---

## 📡 3. TELEMETRY PAYLOAD SPECIFICATION

The firmware must publish data formatted to match the ElysiaJS backend schema (`services/backend/src/modules/sensors`):

### JSON Envelope:
```json
{
  "deviceId": "esp32-aquaponics-main",
  "timestamp": "2026-10-05T12:00:00Z",
  "sensors": {
    "ph": 6.85,
    "tds": 540,
    "waterTemperature": 24.3,
    "airTemperature": 27.8,
    "humidity": 68.5,
    "lightIntensity": 850
  },
  "actuators": {
    "waterPump": true,
    "aerator": true,
    "growLight": false,
    "dosingPump": false
  },
  "diagnostics": {
    "rssi": -62,
    "freeHeap": 184520,
    "uptimeSeconds": 86400
  }
}
```

---

## 🔄 4. COMPLETE ARDUINO/C++ FIRMWARE SKELETON

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <esp_task_wdt.h>

#define WDT_TIMEOUT_SECONDS 30
#define PH_PIN 34
#define TDS_PIN 35
#define ONE_WIRE_BUS 4
#define PUMP_RELAY_PIN 26

const char* WIFI_SSID = "UrbanGrow_AP";
const char* WIFI_PASS = "AquaponicsSecure2026";
const char* BACKEND_INGEST_URL = "http://192.168.1.100:3000/api/sensors/ingest";

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

unsigned long lastTelemetryTick = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // 5-second interval

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi connection failed, will retry next loop.");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, HIGH); // Default OFF for active-low relay
  
  tempSensors.begin();
  
  // Hardware Watchdog Timer setup
  esp_task_wdt_init(WDT_TIMEOUT_SECONDS, true);
  esp_task_wdt_add(NULL);
  
  connectWiFi();
}

void loop() {
  esp_task_wdt_reset(); // Feed the watchdog
  
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastTelemetryTick >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTick = now;
    
    // 1. Read temperature first for TDS compensation
    tempSensors.requestTemperatures();
    float waterTemp = tempSensors.getTempCByIndex(0);
    if (waterTemp == DEVICE_DISCONNECTED_C) waterTemp = 25.0; // Fallback
    
    // 2. Read calibrated sensors
    float phVal = 6.8; // Use readPH(PH_PIN, waterTemp)
    float tdsVal = 480.0; // Use readTDS(TDS_PIN, waterTemp)
    
    // 3. Serialize JSON
    StaticJsonDocument<512> doc;
    doc["deviceId"] = "esp32-aquaponics-main";
    doc["ph"] = phVal;
    doc["tds"] = (int)tdsVal;
    doc["waterTemperature"] = waterTemp;
    doc["airTemperature"] = 26.5;
    doc["humidity"] = 65.0;
    doc["lightIntensity"] = 620;
    
    String payload;
    serializeJson(doc, payload);
    
    // 4. HTTP POST to ElysiaJS Backend
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(BACKEND_INGEST_URL);
      http.addHeader("Content-Type", "application/json");
      int httpCode = http.POST(payload);
      if (httpCode > 0) {
        Serial.printf("[HTTP] POST Result: %d\n", httpCode);
      } else {
        Serial.printf("[HTTP] POST Failed: %s\n", http.errorToString(httpCode).c_str());
      }
      http.end();
    }
  }
}
```

---

## 🛡️ 5. BEST PRACTICES & RELIABILITY CHECKLIST

1. **Watchdog Timer (WDT)**: Always enable ESP32 hardware watchdog timer (`esp_task_wdt`) to auto-restart the node if loops freeze on network calls.
2. **Median Filter for Analog Signals**: Electrical noise from water pumps and aerators corrupts raw analog readings. Always take 15–20 samples and calculate the median or trimmed mean.
3. **Electrolysis Prevention**: Never keep TDS probes powered continuously. Power the TDS sensor via a transistor/GPIO pin only during the 50ms measurement window to extend probe life from weeks to years.
4. **Isolated Relays**: Use optocoupler-isolated relay boards with flyback diodes on AC/inductive loads (submersible water pumps, aerators) to prevent back-EMF rebooting the ESP32.

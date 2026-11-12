#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>

// =====================================================================
// 📶 1. KONFIGURASI WI-FI & BACKEND CLOUD / VPS
// =====================================================================
// Ganti SSID dan Password sesuai hotspot HP atau Wi-Fi yang tersedia:
const char *WIFI_SSID = "Quantum Leap";
const char *WIFI_PASSWORD = "PROYEKgaji";

// Endpoint API Ingest Telemetri VPS UrbanGrow:
const char *SERVER_URL = "https://urbangrow-api.reycannavaro.dev/api/sensors/telemetry";
const char *DEVICE_ID = "ESP32-GROW-01";
const char *FIRMWARE_VERSION = "2.2.0-esp32";
const unsigned long SEND_INTERVAL_MS = 3500; // Kirim tiap 3.5 detik

// =====================================================================
// ⚡ 2. PINOUT HARDWARE (SESUAI PROTOTIPE FISIK)
// =====================================================================
#define RELAY_PIN 14 // Relay Pompa Sirkulasi (Pin 14)
#define RELAY_ON LOW // Active-LOW: LOW = Relay Menyala
#define RELAY_OFF HIGH // Active-LOW: HIGH = Relay Mati

#define LCD_SDA 21 // Pin I2C SDA
#define LCD_SCL 22 // Pin I2C SCL

// Alamat I2C LCD 16x2 (umumnya 0x27 atau 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// =====================================================================
// 🧪 3. VARIABEL SIMULASI RANDOM WALK (REALISTIS & STABIL)
// =====================================================================
// Nilai sensor mengapung secara halus (Brownian smooth random walk)
// di sekitar parameter biologis ideal akuaponik:
float currentPH = 7.12;           // Ideal: 6.80 - 7.35 pH
float currentWaterTemp = 25.4;    // Ideal: 24.2 - 26.2 °C
float currentAirTemp = 28.6;      // Ideal: 27.0 - 30.5 °C
float currentHumidity = 68.0;     // Ideal: 62% - 75%
float currentLux = 580.0;         // Ideal: 400 - 800 lux

bool isPumpOn = true;
unsigned long lastSendTime = 0;
int lastHttpStatus = 0;
unsigned long lastLcdFlip = 0;
bool lcdPage = false;

// =====================================================================
// 🛠️ 4. FUNGSI UPDATE RANDOM WALK SENSOR (HALUS & ALAMI)
// =====================================================================
void updateRealisticSensors() {
  // 1. pH Air Kolam (drift halus ±0.03 pH)
  float deltaPH = (random(-30, 31) / 1000.0);
  currentPH = constrain(currentPH + deltaPH, 6.82, 7.32);

  // 2. Suhu Air DS18B20 (drift halus ±0.1 °C)
  float deltaWater = (random(-10, 11) / 100.0);
  currentWaterTemp = constrain(currentWaterTemp + deltaWater, 24.2, 26.2);

  // 3. Suhu Udara DHT22 (drift halus ±0.15 °C)
  float deltaAir = (random(-15, 16) / 100.0);
  currentAirTemp = constrain(currentAirTemp + deltaAir, 27.2, 30.4);

  // 4. Kelembaban Udara DHT22 (drift halus ±0.4 %)
  float deltaHum = (random(-40, 41) / 100.0);
  currentHumidity = constrain(currentHumidity + deltaHum, 62.0, 74.0);

  // 5. Cahaya LDR (drift halus ±20 lux)
  float deltaLux = (float)random(-20, 21);
  currentLux = constrain(currentLux + deltaLux, 420.0, 780.0);
}

// Kendali status fisik relay pompa
void setPump(bool state) {
  isPumpOn = state;
  digitalWrite(RELAY_PIN, isPumpOn ? RELAY_ON : RELAY_OFF);
}

// =====================================================================
// 📡 5. FUNGSI KIRIM TELEMETRI KE API BACKEND CLOUD / VPS
// =====================================================================
void sendTelemetryToApi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Terputus, mencoba menyambung ulang...");
    WiFi.reconnect();
    return;
  }

  // Update nilai sensor random realistis sebelum pengiriman
  updateRealisticSensors();

  WiFiClientSecure client;
  client.setInsecure(); // Bypass SSL verification untuk transmisi IoT ringan

  HTTPClient https;
  https.setTimeout(4000);

  Serial.println("\n------------------------------------------------");
  Serial.print("[HTTP] Menghubungkan ke API: ");
  Serial.println(SERVER_URL);

  if (https.begin(client, SERVER_URL)) {
    https.addHeader("Content-Type", "application/json");

    // Bentuk payload JSON telemetri 4 sensor fisik
    StaticJsonDocument<768> doc;
    doc["device_id"] = DEVICE_ID;
    doc["wifi_rssi_dbm"] = WiFi.RSSI();
    doc["firmware_version"] = FIRMWARE_VERSION;

    // 2 Sensor Didalam Air
    doc["ph"] = round(currentPH * 100.0) / 100.0;
    doc["waterTemperature"] = round(currentWaterTemp * 10.0) / 10.0;

    // 2 Sensor Diluar Air
    doc["airTemperature"] = round(currentAirTemp * 10.0) / 10.0;
    doc["humidity"] = round(currentHumidity * 10.0) / 10.0;
    doc["lightIntensity"] = round(currentLux);

    // Laporan kapabilitas & status perangkat keras aktuator
    JsonObject cap = doc.createNestedObject("hardwareCapabilities");
    cap["waterPump"] = true;    // Relay 1 (GPIO 14) terpasang fisik
    cap["aerator"] = false;     // Belum terpasang (tahap pengembangan)
    cap["growLight"] = false;   // Belum terpasang (tahap pengembangan)
    cap["feeder"] = false;      // Belum terpasang (tahap pengembangan)
    cap["dosingPump"] = false;  // Belum terpasang (tahap pengembangan)

    JsonObject actStatus = doc.createNestedObject("actuatorStates");
    actStatus["waterPump"] = isPumpOn;
    actStatus["aerator"] = false;
    actStatus["growLight"] = false;
    actStatus["feeder"] = false;
    actStatus["dosingPump"] = false;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.print("[HTTP] Payload dikirim: ");
    Serial.println(requestBody);

    int httpCode = https.POST(requestBody);
    lastHttpStatus = httpCode;

    if (httpCode > 0) {
      Serial.printf("[HTTP] Respons Server: %d\n", httpCode);
      String response = https.getString();
      Serial.print("[HTTP] Data Respons: ");
      Serial.println(response);

      // Sinkronisasi kendali relay pompa dari respons backend
      StaticJsonDocument<1536> respDoc;
      DeserializationError err = deserializeJson(respDoc, response);
      if (err) {
        Serial.printf("[JSON] Deserialisasi gagal: %s\n", err.c_str());
      } else if (respDoc.containsKey("commands")) {
        JsonObject cmd = respDoc["commands"];
        JsonObject acts = cmd.containsKey("actuators") ? cmd["actuators"].as<JsonObject>() : cmd;
        if (acts.containsKey("waterPump")) {
          bool targetPump = acts["waterPump"];
          if (targetPump != isPumpOn) {
            Serial.printf("[RELAY] Perintah Server Diterima: Ubah Pompa -> %s\n", targetPump ? "ON" : "OFF");
            setPump(targetPump);
          }
        }
        // Evaluasi penolakan dinamis untuk aktuator yang belum terpasang
        const char* uninstalled[] = {"aerator", "growLight", "feeder", "dosingPump"};
        for (const char* name : uninstalled) {
          if (acts.containsKey(name) && acts[name] == true) {
            Serial.printf("[HARDWARE] Perintah '%s' ON ditolak: Hardware belum terpasang (tahap pengembangan).\n", name);
          }
        }
      }
    } else {
      Serial.printf("[HTTP] Gagal POST, error: %s\n", https.errorToString(httpCode).c_str());
    }

    https.end();
  } else {
    Serial.println("[HTTP] Tidak dapat membuka koneksi HTTPS.");
    lastHttpStatus = -1;
  }
}

// =====================================================================
// 📺 6. FUNGSI UPDATE TAMPILAN LCD 16x2
// =====================================================================
void updateLcdDisplay() {
  unsigned long now = millis();
  if (now - lastLcdFlip >= 2500) {
    lastLcdFlip = now;
    lcdPage = !lcdPage;
    lcd.clear();
  }

  if (!lcdPage) {
    // Halaman 1: Sensor Air (pH & Suhu Air) + Status Pompa
    lcd.setCursor(0, 0);
    lcd.printf("pH:%.2f W:%.1fC", currentPH, currentWaterTemp);

    lcd.setCursor(0, 1);
    lcd.printf("PMP:%s [%s]", isPumpOn ? "ON " : "OFF", lastHttpStatus == 200 ? "OK" : "ERR");
  } else {
    // Halaman 2: Sensor Luar (Suhu Udara & Cahaya LDR) + WiFi RSSI
    lcd.setCursor(0, 0);
    lcd.printf("Air:%.1fC L:%d", currentAirTemp, (int)currentLux);

    lcd.setCursor(0, 1);
    if (WiFi.status() == WL_CONNECTED) {
      lcd.printf("WiFi:%ddBm OK", WiFi.RSSI());
    } else {
      lcd.print("WiFi: DISCONNECT");
    }
  }
}

// =====================================================================
// 🚀 7. SETUP PROGRAM (INISIALISASI)
// =====================================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n==============================================");
  Serial.println("  URBANGROW SMART AQUAPONICS - ESP32 FIRMWARE ");
  Serial.println("==============================================");

  // Inisialisasi Relay Pompa
  pinMode(RELAY_PIN, OUTPUT);
  setPump(true); // Default menyala saat pertama kali boot
  Serial.println("[RELAY] Pompa 12V (Pin 14) diinisialisasi: ON");

  // Inisialisasi LCD 16x2 I2C
  Wire.begin(LCD_SDA, LCD_SCL);
  lcd.init();
  lcd.backlight();
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("UrbanGrow Smart");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi..");

  // Inisialisasi Wi-Fi
  Serial.printf("[WIFI] Menyambung ke SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Berhasil terhubung!");
    Serial.print("[WIFI] IP Address: ");
    Serial.println(WiFi.localIP());

    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
  } else {
    Serial.println("\n[WIFI] Gagal terhubung (Timeout). Berjalan offline.");
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed!");
    lcd.setCursor(0, 1);
    lcd.print("Mode Standalone");
  }

  delay(2000);
  lcd.clear();

  // Inisialisasi seed random generator berdasarkan noise analog pin
  randomSeed(analogRead(36) + millis());
}

// =====================================================================
// 🔁 8. LOOP UTAMA
// =====================================================================
void loop() {
  unsigned long now = millis();

  // Siklus kirim data telemetri ke server
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    sendTelemetryToApi();
  }

  // Siklus update tampilan layar LCD
  updateLcdDisplay();

  delay(50);
}

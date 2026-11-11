#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <Wire.h>

// ==========================================
// 📶 1. KONFIGURASI WI-FI & DASHBOARD BACKEND
// ==========================================
// Silakan sesuaikan nama & password Wi-Fi atau Hotspot HP Anda
const char *WIFI_SSID = "gabess";
const char *WIFI_PASSWORD = "rintocans";

// Masukkan IP Lokal laptop Anda (Port 3000):
// IP saat ini dari adapter Wi-Fi / Hotspot laptop: 172.20.10.2
const char *SERVER_URL = "http://172.20.10.2:3000/api/sensors/telemetry";

const char *DEVICE_ID = "ESP32-GROW-01";
const unsigned long SYNC_INTERVAL_MS =
    2500; // Siklus kirim sensor & baca perintah (tiap 2.5 detik)

// ==========================================
// 🔌 2. KONFIGURASI I2C (SENSOR CAHAYA BH1750 / OLED)
// ==========================================
#define SDA_PIN 21
#define SCL_PIN 22

byte bh1750Address =
    0; // Otomatis terdeteksi saat I2C scanning (biasanya 0x23 atau 0x5C)
float lastLuxValue = 0.0;

// ==========================================
// ⚡ 3. KONFIGURASI RELAY AKTUATOR (ACTIVE-LOW)
// ==========================================
#define RELAY_PUMP_PIN 25      // Relay 1: Pompa Sirkulasi (waterPump)
#define RELAY_AERATOR_PIN 26   // Relay 2: Aerator DO O2 (aerator)
#define RELAY_FEEDER_PIN 27    // Relay 3: Auto-Feeder Ikan (feeder)
#define RELAY_GROWLIGHT_PIN 33 // Relay 4: LED Grow Light (growLight)

#define RELAY_ON LOW   // Active-LOW: LOW = Relay Menyala
#define RELAY_OFF HIGH // Active-LOW: HIGH = Relay Mati

// Status internal relay
bool statePump = true;
bool stateAerator = true;
bool stateFeeder = false;
bool stateGrowLight = false;

unsigned long lastSyncTime = 0;

// ==========================================
// 🛠️ FUNGSI: INISIALISASI & KENDALI RELAY
// ==========================================
void applyRelay(int pin, bool isOn) {
  digitalWrite(pin, isOn ? RELAY_ON : RELAY_OFF);
}

void initRelays() {
  // Set output ke HIGH terlebih dahulu sebelum pinMode untuk mencegah
  // clicking/relay chatter
  digitalWrite(RELAY_PUMP_PIN, RELAY_OFF);
  digitalWrite(RELAY_AERATOR_PIN, RELAY_OFF);
  digitalWrite(RELAY_FEEDER_PIN, RELAY_OFF);
  digitalWrite(RELAY_GROWLIGHT_PIN, RELAY_OFF);

  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(RELAY_AERATOR_PIN, OUTPUT);
  pinMode(RELAY_FEEDER_PIN, OUTPUT);
  pinMode(RELAY_GROWLIGHT_PIN, OUTPUT);

  // Terapkan status awal
  applyRelay(RELAY_PUMP_PIN, statePump);
  applyRelay(RELAY_AERATOR_PIN, stateAerator);
  applyRelay(RELAY_FEEDER_PIN, stateFeeder);
  applyRelay(RELAY_GROWLIGHT_PIN, stateGrowLight);
}

// ==========================================
// 🔍 FUNGSI: I2C SCANNER & DETEKSI OTOMATIS SENSOR
// ==========================================
void scanI2CDevices() {
  Wire.begin(SDA_PIN, SCL_PIN);

  Serial.println();
  Serial.println("=========================================");
  Serial.println("🔍 Memulai I2C Scanner (SDA: 21, SCL: 22)");
  Serial.println("=========================================");

  byte error;
  int jumlah = 0;

  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("✅ Perangkat I2C ditemukan di alamat: 0x");
      if (address < 16)
        Serial.print("0");
      Serial.print(address, HEX);

      // Identifikasi sensor umum UrbanGrow
      if (address == 0x23 || address == 0x5C) {
        Serial.print(" -> [Sensor Cahaya BH1750]");
        bh1750Address = address;
        // Inisialisasi Continuous H-Resolution Mode (0x10)
        Wire.beginTransmission(bh1750Address);
        Wire.write(0x10);
        Wire.endTransmission();
      } else if (address == 0x3C || address == 0x3D) {
        Serial.print(" -> [Display OLED SSD1306]");
      } else if (address == 0x68) {
        Serial.print(" -> [RTC DS3231 / MPU6050]");
      }
      Serial.println();
      jumlah++;
    }
  }

  if (jumlah == 0) {
    Serial.println("⚠️ Tidak ada perangkat I2C ditemukan pada pin 21 & 22.");
  } else {
    Serial.printf("✨ Scan selesai. Total %d perangkat I2C aktif.\n", jumlah);
  }
  Serial.println("-----------------------------------------");
}

// Membaca intensitas cahaya dari BH1750 via I2C jika tersedia
float readBH1750Lux() {
  if (bh1750Address == 0)
    return 650.0; // Nilai baseline jika sensor belum terpasang

  Wire.requestFrom((int)bh1750Address, 2);
  if (Wire.available() == 2) {
    uint16_t raw = (Wire.read() << 8) | Wire.read();
    float lux = raw / 1.2;
    lastLuxValue = lux;
    return lux;
  }
  return lastLuxValue;
}

// ==========================================
// 📶 FUNGSI: WI-FI AUTO-CONNECT
// ==========================================
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED)
    return;

  Serial.println();
  Serial.print("📶 Menghubungkan ke Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 25) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Berhasil Terhubung!");
    Serial.print("📍 IP Address ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 Target Dashboard API: ");
    Serial.println(SERVER_URL);
  } else {
    Serial.println(
        "\n⚠️ Gagal konek Wi-Fi. Akan mencoba menyambung ulang nanti.");
  }
}

// ==========================================
// 🔄 FUNGSI: SINKRONISASI TELEMETRI & KONTROL DASHBOARD
// ==========================================
void syncWithDashboard() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000);

  // 1. Siapkan Telemetri JSON yang dikirim ke Dashboard
  StaticJsonDocument<512> reqDoc;
  reqDoc["device_id"] = DEVICE_ID;
  reqDoc["wifi_rssi_dbm"] = WiFi.RSSI();

  // Baca Lux dari I2C BH1750
  float currentLux = readBH1750Lux();
  reqDoc["lux"] = currentLux;
  reqDoc["lightIntensity"] = currentLux;

  String reqJson;
  serializeJson(reqDoc, reqJson);

  // 2. Kirim POST Request ke Backend
  int httpCode = http.POST(reqJson);

  if (httpCode == HTTP_CODE_OK || httpCode == 201) {
    String responseJson = http.getString();

    // 3. Terima & Parse Perintah Aktuator dari Web Dashboard
    StaticJsonDocument<1024> resDoc;
    DeserializationError error = deserializeJson(resDoc, responseJson);

    if (!error) {
      JsonObject commands = resDoc["commands"];
      if (!commands.isNull() && !commands["actuators"].isNull()) {
        JsonObject actuators = commands["actuators"];

        bool newPump = actuators["waterPump"] | statePump;
        bool newAerator = actuators["aerator"] | stateAerator;
        bool newGrowLight = actuators["growLight"] | stateGrowLight;
        bool newFeeder = actuators["feeder"] | stateFeeder;

        // Cek jika ada saklar yang ditekan di Dashboard
        if (newPump != statePump || newAerator != stateAerator ||
            newGrowLight != stateGrowLight || newFeeder != stateFeeder) {
          Serial.println("\n⚡ [PERINTAH DITERIMA DARI WEB DASHBOARD]");
          Serial.printf("  -> Pompa Sirkulasi: %s\n", newPump ? "ON" : "OFF");
          Serial.printf("  -> Aerator O2     : %s\n",
                        newAerator ? "ON" : "OFF");
          Serial.printf("  -> LED Grow Light : %s\n",
                        newGrowLight ? "ON" : "OFF");
          Serial.printf("  -> Auto Feeder    : %s\n", newFeeder ? "ON" : "OFF");
        }

        // Terapkan perubahan ke modul Relay Fisik
        statePump = newPump;
        stateAerator = newAerator;
        stateGrowLight = newGrowLight;
        stateFeeder = newFeeder;

        applyRelay(RELAY_PUMP_PIN, statePump);
        applyRelay(RELAY_AERATOR_PIN, stateAerator);
        applyRelay(RELAY_FEEDER_PIN, stateFeeder);
        applyRelay(RELAY_GROWLIGHT_PIN, stateGrowLight);
      }
    }
  } else {
    Serial.printf("⚠️ Gagal komunikasi ke Dashboard (HTTP Code: %d)\n",
                  httpCode);
  }

  http.end();
}

// ==========================================
// 🚀 ARDUINO SETUP & MAIN LOOP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=======================================================");
  Serial.println("🌱 UrbanGrow Smart Aquaponic - Memulai Sistem Hardware");
  Serial.println("=======================================================");

  // 1. Inisialisasi Relay Aktuator (Kondisi aman saat boot)
  initRelays();

  // 2. Jalankan I2C Scanner (Pin 21 SDA, Pin 22 SCL)
  scanI2CDevices();

  // 3. Hubungkan ke Wi-Fi
  connectToWiFi();
}

void loop() {
  // Lakukan sinkronisasi data & perintah aktuator setiap interval (2.5 detik)
  unsigned long currentMillis = millis();
  if (currentMillis - lastSyncTime >= SYNC_INTERVAL_MS) {
    lastSyncTime = currentMillis;
    syncWithDashboard();
  }
}

# ⚡ Panduan Flashing Firmware ESP32 UrbanGrow

Firmware ini digunakan untuk menghubungkan modul mikrokontroler **ESP32 DevKit V1** dengan **UrbanGrow Backend & Web Dashboard**.

---

## 📦 1. Persiapan Arduino IDE & Library

1. Pastikan **Arduino IDE** (v2.x disarankan) sudah terinstal.
2. Tambahkan URL Board ESP32 di **File -> Preferences -> Additional Boards Manager URLs**:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Install Board: Buka **Tools -> Board -> Boards Manager**, cari `esp32` by Espressif Systems lalu install.
4. Install Library: Buka **Sketch -> Include Library -> Manage Libraries**, cari dan install:
   - **`ArduinoJson`** (oleh Benoit Blanchon, versi 6.x atau 7.x)

---

## 🔌 2. Wiring Pinout ESP32 ke Modul Relay 4-Channel

| Nama Aktuator di Dashboard | Kode Relay | Pin ESP32 | Logika Sinyal |
|---|---|---|---|
| **Pompa Sirkulasi (12V)** | Relay 1 (IN1) | **GPIO 25** | Active-LOW (`LOW` = ON) |
| **Aerator Oksigen Nila** | Relay 2 (IN2) | **GPIO 26** | Active-LOW (`LOW` = ON) |
| **Auto-Feeder Pakan Ikan** | Relay 3 (IN3) | **GPIO 27** | Active-LOW (`LOW` = ON) |
| **LED Grow Light** | Relay 4 (IN4) | **GPIO 33** | Active-LOW (`LOW` = ON) |
| **VCC Relay** | VCC | **VIN (5V ESP32)** | - |
| **GND Relay** | GND | **GND ESP32** | Common Ground |

---

## ⚙️ 3. Konfigurasi Sketch Sebelum Upload

Buka file `esp32_urbangrow.ino` di Arduino IDE, lalu sesuaikan bagian atas:

1. **`WIFI_SSID` & `WIFI_PASSWORD`**:
   Masukkan nama Wi-Fi atau Hotspot HP Anda.
   *(PENTING: Laptop dan ESP32 harus terhubung ke Wi-Fi / Hotspot yang sama)*.

2. **`SERVER_URL`**:
   Masukkan IP lokal laptop Anda.
   Contoh: jika IP laptop Anda `192.168.18.63`, maka:
   ```cpp
   const char* SERVER_URL = "http://192.168.18.63:3000/api/sensors/telemetry";
   ```

---

## 🚀 4. Langkah Flashing & Uji Coba

1. Colokkan kabel micro USB ESP32 ke laptop.
2. Di Arduino IDE, pilih board: **`DOIT ESP32 DEVKIT V1`** dan pilih Port COM yang sesuai.
3. Klik tombol **Upload** (tanda panah ke kanan).
4. Setelah selesai upload, buka **Tools -> Serial Monitor** dengan baud rate `115200`.
5. Buka Web Dashboard di browser: `http://localhost:3001`.
6. Klik tombol saklar pada kartu kontrol aktuator (misal: matikan Pompa atau hidupkan Grow Light).
7. Perhatikan modul relay fisik Anda: lampu indikator relay akan berubah dan terdengar bunyi *klik* relay fisik!


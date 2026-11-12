SELARAS IoT - PlatformIO
=========================
Pin:
HW-828 PO -> GPIO35 (belum dibaca; pH simulasi)
DS18B20 DQ -> GPIO26 (belum dibaca; suhu simulasi)
LDR AO -> GPIO27 (belum dibaca; cahaya simulasi)
Relay CH1 -> GPIO25
LCD SDA -> GPIO21
LCD SCL -> GPIO22

Cara:
1. Extract ZIP.
2. Buka folder SELARAS_IOT_POMPA di VS Code.
3. Install PlatformIO IDE.
4. Sambungkan ESP32 dengan kabel USB DATA.
5. Buka project dan tunggu library ter-install.
6. Klik Build.
7. Klik Upload.
8. Buka Serial Monitor pada 115200 baud.
9. Setelah boot, CH1 relay diperintah ON dan data simulasi tampil di LCD.

KESELAMATAN:
ESP32 tidak boleh menerima 220-240 VAC. ESP32 hanya mengendalikan input relay.
Jalur AC pompa harus melewati kontak relay yang benar dan dipasang dengan proteksi
serta enclosure yang sesuai. Matikan sumber listrik sebelum mengubah wiring.

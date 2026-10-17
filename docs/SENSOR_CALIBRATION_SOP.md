# 🧪 Standard Operating Procedure: Kalibrasi Sensor Lapangan

> **Sistem**: UrbanGrow Smart Aquaponic  
> **Instrumen**: PH-4502C, Analog TDS Meter, DS18B20  
> **Periode**: Setiap 30 Hari Operasional

---

## 🔬 1. Kalibrasi pH Sensor (PH-4502C)

### Bahan yang Diperlukan:
- Larutan Buffer Standar pH 6.86 (Netral)
- Larutan Buffer Standar pH 4.01 (Asam)
- Air Aquadest / Deionisasi (Pembersih)

### Prosedur Dua Titik (Two-Point Calibration):
1. Bilas probe elektroda kaca dengan aquadest dan keringkan secara hati-hati menggunakan tisu bebas serat (*lint-free tissue*).
2. Celupkan probe ke dalam larutan buffer pH 6.86. Tunggu pembacaan stabil selama 60 detik.
3. Putar potensiometer offset pada board pengondisi sinyal PH-4502C hingga tegangan output multimeter menunjukkan $2.50\text{ V}$.
4. Bilas kembali elektroda, lalu celupkan ke dalam larutan buffer pH 4.01.
5. Catat nilai tegangan ADC pada monitor serial ESP32 untuk menghitung kemiringan (*slope*) kalibrasi:
   $$m = \frac{6.86 - 4.01}{V_{6.86} - V_{4.01}}$$

---

## ⚡ 2. Kalibrasi TDS Nutrisi

1. Masukkan probe TDS ke larutan standar 1413 µS/cm (~707 ppm TDS).
2. Sesuaikan pembacaan koefisien kompensasi suhu dengan sensor suhu DS18B20 yang diletakkan berdampingan.
3. Pastikan tidak ada gelembung udara yang menempel pada ujung elektroda titanium probe TDS.

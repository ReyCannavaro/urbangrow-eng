# 🌿 UrbanGrow Plant Nutrient Deficiency Diagnostic Guide

> **Fokus Kultivar**: Pakcoy (*Brassica rapa subsp. chinensis*) & Kangkung (*Ipomoea aquatica*)  
> **Konstruksi**: 4-Level Vertical NFT / Media Bed Aquaponic  
> **Institusi**: SMK Telkom Sidoarjo (Regu Mawar)  
> **Status**: Approved Botanical Diagnostic SOP

---

## 🔬 1. Dinamika Hara dalam Ekosistem Akuaponik

Berbeda dengan hidroponik murni di mana pupuk kimiawi sintetis ditambahkan secara presisi, akuaponik mengandalkan mineralisasi feses ikan oleh bakteri nitrifikasi dan mikroba pengurai:

1. **Kelebihan Alami**: Nitrogen ($\text{NO}_3^-$) dan Fosfor ($\text{PO}_4^{3-}$) berlimpah dari metabolisme ikan.
2. **Defisiensi Sistemik yang Lazim**:
   - **Besi (Fe)**: Sangat mudah terikat atau mengendap jika pH > 7.5.
   - **Kalium (K)**: Pakan ikan komersial umumnya rendah kalium dibandingkan kebutuhan sayuran daun.
   - **Kalsium (Ca)**: Dibutuhkan untuk kekuatan dinding sel, rentan terhambat pada transpirasi rendah / kelembapan ekstrem.

---

## 📋 2. Matriks Gejala Defisiensi Unsur Hara

| Unsur Hara | Lokasi Daun | Gejala Visual Utama | Penyebab Khas Akuaponik | Tindakan Korektif Aman Ikan |
|---|---|---|---|---|
| **Besi (Fe)** | Daun Muda (Pucuk) | Klorosis interveinal (daun menguning di sela urat daun hijau tegas) | pH > 7.5 membuat Fe mengendap; aerasi anaerob lokal | Tambahkan **Fe-DTPA** (pH < 7.2) atau **Fe-EDDHA** (pH > 7.2) 2 mg/L |
| **Kalium (K)** | Daun Tua (Bawah) | Pinggiran daun terbakar (*marginal necrosis*), melengkung ke bawah | Konsumsi tinggi fase vegetatif, pakan ikan defisit K | Dosis semprot daun (*foliar spray*) $\text{KHCO}_3$ (0.5%) atau ke tangki biofilter |
| **Kalsium (Ca)**| Titik Tumbuh | Daun menggulung, ujung gosong (*tip-burn*), pertumbuhan terhambat | RH udara > 85% menghambat transpirasi; kompetisi kation | Naikkan ventilasi exhaust fan, semprot daun $\text{CaCl}_2$ food-grade |
| **Magnesium (Mg)**| Daun Menengah & Tua | Klorosis interveinal dengan bercak ungu/perunggu di tepi daun | Air baku rendah mineral (*soft water*) | Garam Epsom ($\text{MgSO}_4 \cdot 7\text{H}_2\text{O}$) 5-10 ppm ke biofilter |
| **Nitrogen (N)**| Daun Tua | Seluruh helai daun menguning pucat merata, batang kurus | Densitas ikan terlalu rendah, biofilter mati/belum matang | Naikkan rasio pakan ikan harian atau densitas bibit nila |
| **Fosfor (P)** | Daun Tua | Warna hijau gelap keunguan kusam, perakaran kerdil cokelat | Air dingin (< 18°C), pH ekstrem | Sesuaikan temperatur air; asam fosfat encer secara perlahan |

---

## 🛠️ 3. Protokol Penambahan Suplemen Tanpa Meracuni Ikan (Fish Safety Protocol)

> [!CAUTION]
> Bahan-bahan kimia berbahaya bagi ikan seperti pupuk NPK konvensional yang mengandung surfaktan, urea pekat, atau klorin **DILARANG KERAS** masuk ke tangki akuaponik!

### Prosedur Tambah Kalium & Kalsium:
- Gunakan **Kalium Hidroksida ($\text{KOH}$)** atau **Kalium Bikarbonat ($\text{KHCO}_3$)** sekaligus sebagai pengatur penaik pH air (*pH Up*).
- Gunakan **Kalsium Hidroksida ($\text{Ca(OH)}_2$ / hydrated lime)** berselingan dengan Kalium Bikarbonat untuk menstabilkan buffer alkalinitas ($\text{kH} > 4\text{ dKH}$).

### Formulasi Chelated Iron (Besi Kelat):
- Gunakan **Fe-DTPA 7%**: Efektif untuk rentang pH operasional UrbanGrow ($6.5 - 7.5$).
- Tambahkan setiap 2-3 minggu dengan dosis target $2.0\text{ ppm}$ ($2\text{ g / 1000 Liter}$ air kolam).
- Lakukan aplikasi pada sore hari menjelang gelap, karena senyawa kelat besi peka terhadap degradasi fotolisis cahaya UV matahari.

---

## 📈 4. Integrasi dengan AI Vision & Anomaly Engine

Pada roadmap sistem otomatisasi UrbanGrow:
1. **Camera Feed & Multi-Spectral**: Analisis rasio warna RGB daun pada Level 2 & 4 untuk indeks klorosis.
2. **Korelasi Data Deret Waktu**:
   - Jika TDS rendah ($< 350\text{ ppm}$) dan pH naik ($> 7.6$), sistem AI membangkitkan alert: `"High Risk: Fe Precipitation & Nutrient Lockout"`.

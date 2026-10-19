# 🐟 UrbanGrow Aquaculture & Fish Welfare Guide

> **Spesies Budidaya**: Ikan Nila (*Oreochromis niloticus*) & Ikan Lele (*Clarias gariepinus*)  
> **Konfigurasi Bertingkat**: Level 3 (Nila - High DO) & Level 1 (Lele - Hardiness Tank)  
> **Institusi**: SMK Telkom Sidoarjo (Regu Mawar)  
> **Status**: Approved Aquaculture Welfare Standard

---

## 🌊 1. Profil Fisiologis & Kebutuhan Kualitas Air

| Parameter Fisika/Kimia | Ikan Nila (*Level 3*) | Ikan Lele (*Level 1*) | Ambang Batas Bahaya (Kritis) |
|---|---|---|---|
| **Dissolved Oxygen (DO)** | $5.0 - 7.5\text{ mg/L}$ | $2.0 - 5.0\text{ mg/L}$ (Organ Labirin) | $< 3.0\text{ mg/L}$ (Nila) / $< 1.0\text{ mg/L}$ (Lele) |
| **Temperatur Air** | $25 - 28^\circ\text{C}$ | $26 - 30^\circ\text{C}$ | $< 20^\circ\text{C}$ atau $> 33^\circ\text{C}$ |
| **pH Air** | $6.8 - 7.6$ | $6.5 - 7.8$ | $< 6.0$ (Asidosis) / $> 8.2$ (Toksisitas $\text{NH}_3$) |
| **Amonia Bebas ($\text{NH}_3$)** | $< 0.05\text{ mg/L}$ | $< 0.10\text{ mg/L}$ | $> 0.20\text{ mg/L}$ (Nekrosis insang) |
| **Nitrit ($\text{NO}_2^-$)** | $< 0.50\text{ mg/L}$ | $< 1.00\text{ mg/L}$ | $> 2.00\text{ mg/L}$ (Penyakit Darah Cokelat / Methemoglobinemia) |
| **Nitrat ($\text{NO}_3^-$)** | $< 150\text{ mg/L}$ | $< 250\text{ mg/L}$ | Sayuran menyerap sebagai nutrisi utama |

---

## 👁️ 2. Indikator Etologis & Deteksi Dini Stres (Fish Ethology)

Ikan memberikan sinyal perilaku sebelum terjadi kematian massal. Sensor IoT dan operator manusia memantau tanda-tanda berikut:

### Gejala Hipoksia (Kekurangan Oksigen Terlarut):
- **Piping**: Ikan bergerombol di permukaan air membuka mulut mengambil lapisan udara tipis kaya oksigen.
- **Kelesuan (Lethargy)**: Penurunan respons terhadap pakan atau gangguan fisik.
- **Tindakan**: Aktuator aerator otomatis menyala 100%, sistem mengaktifkan venturi booster.

### Toksisitas Amonia ($\text{NH}_3$) & Nitrit ($\text{NO}_2^-$):
- Ikan menggesekkan badan ke dinding bak/pipa (*flashing*).
- Insang membengkak merah tua atau berubah kecokelatan kusam (*brown blood disease*).
- **Tindakan Cepat**: Hentikan pemberian pakan total selama 24 jam; kuras 25% volume air; tambahkan garam non-iodin ($\text{NaCl}$) $1 - 2\text{ g/L}$ untuk memblokir penyerapan nitrit oleh insang.

---

## 🍽️ 3. Manajemen Pakan Terkalibrasi (FCR & Feed Rate)

Pakan adalah sumber utama nutrisi tanaman dan polutan air. Laju pakan dihitung berdasarkan biomassa total dan suhu air:

$$R_{\text{feed}} = B_{\text{total}} \times P_{\text{rate}}(T)$$

1. **Suhu $26 - 29^\circ\text{C}$ (Optimal)**: Berikan $2.5 - 3.0\%$ bobot biomassa harian (terbagi 2x: pukul 08:30 dan 16:30).
2. **Suhu $22 - 25^\circ\text{C}$ (Sejuk)**: Turunkan ke $1.5 - 2.0\%$ biomassa. Metabolisme melambat.
3. **Suhu $> 31^\circ\text{C}$ (Panas Ekstrem)**: Turunkan ke $1.0\%$ atau tunda sampai air mendingin. Suhu tinggi menurunkan kelarutan oksigen saat pencernaan butuh oksigen tinggi (*Specific Dynamic Action*).
4. **Food Conversion Ratio (FCR) Target**: $\le 1.25$ (1.25 kg pakan menghasilkan 1.0 kg pertumbuhan ikan).

---

## 🛡️ 4. Prosedur Karantina & Pengobatan Alami (Bio-Safe Treatments)

UrbanGrow menerapkan zero-synthetic antibiotic policy untuk melindungi biofilter dan sayuran konsumsi:

1. **Perendaman Garam Krosok ($\text{NaCl}$ Non-Iodin)**:
   - Konsentrasi isolasi: $3 - 5\text{ ppt}$ selama 15-30 menit untuk merontokkan ektoparasit (*Trichodina*, *Ichthyophthirius*).
2. **Ekstrak Daun Ketapang (*Terminalia catappa*)**:
   - Menurunkan stres, menghambat jamur air (*Saprolegnia*), dan menstabilkan asam organik alami.
3. **Pemberian Probiotik Mikroba (*Bacillus subtilis* & *Lactobacillus*)**:
   - Dicampur ke pakan untuk memperkuat imunitas usus dan mempercepat pemecahan limbah organik di feses.

# 🎨 UrbanGrow Sticker & Brand Asset Studio

Direktori ini berisi seluruh aset stiker dan logo UrbanGrow yang telah dikonversi menjadi format **Vector SVG (Resolusi Tak Terbatas / Infinite Resolution)** dan **Ultra-HD Raster PNG** dengan penajaman kontur tepi (*Edge Unsharp Masking*) menggunakan script Python.

---

## 📁 Daftar Format & File yang Tersedia

Setiap aset stiker (`1`, `2`, `3`, `4`) memiliki 4 varian format:

| Nama Aset | Keterangan Grafis | Vektor Standar (.svg) | Vektor Tight-Fit (.svg) | Ultra-HD Raster (.png) |
|---|---|---|---|---|
| **`1`** | Logo Horizontal UrbanGrow (Ikon Daun/Ikan + Wordmark) | [`1.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/1.svg) *(Canvas Penuh)* | [`1_tight.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/1_tight.svg) *(Cropped Pas)* | [`1_hd.png`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/1_hd.png) |
| **`2`** | Wordmark Lebar UrbanGrow Horizontal | [`2.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/2.svg) *(Canvas Penuh)* | [`2_tight.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/2_tight.svg) *(Cropped Pas)* | [`2_hd.png`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/2_hd.png) |
| **`3`** | Badge / Emblem Bulat UrbanGrow (Canvas Horizontal) | [`3.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/3.svg) *(Canvas Penuh)* | [`3_tight.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/3_tight.svg) *(Cropped Pas)* | [`3_hd.png`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/3_hd.png) |
| **`4`** | Badge Persegi / Avatar Favicon UrbanGrow | [`4.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/4.svg) *(1:1 Square)* | [`4_tight.svg`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/4_tight.svg) *(Cropped Pas)* | [`4_hd.png`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/4_hd.png) |

---

## 🚀 Keunggulan Format Vektor (`.svg`)

1. **Infinite Resolution**: Berbasis rumus kurva matematika (Spline Bezier Curves), dapat di-zoom hingga 10.000% atau dicetak di banner billboard tanpa pecah atau buram sama sekali.
2. **Siap Cetak Stiker & Merchandise**: Langsung kompatibel dengan mesin cutting stiker, plotter vinil, sablon DTF, laser engraving, dan software desain (Adobe Illustrator, CorelDRAW, Figma, Inkscape).
3. **Background Transparan Asli**: Tidak ada kotak putih di latar belakang.
4. **Varian Tight-Fit (`_tight.svg`)**: Margin transparan kosong otomatis dipangkas rapi dengan bantalan *safe padding* 24px sehingga pas saat ditempel pada stiker atau header website.

---

## 🛠️ Cara Menjalankan Ulang Script Python

Jika di kemudian hari Anda menambahkan foto stiker baru atau ingin memproses ulang:

```bash
# Pastikan library terinstall
pip install vtracer pillow numpy

# Jalankan script konversi
python urbangrow-sticker/convert_stickers.py
```
Script tersebut berlokasi di [`urbangrow-sticker/convert_stickers.py`](file:///c:/Users/Rey%20Cannavaro/urbangrow-workspace/urbangrow-sticker/convert_stickers.py).

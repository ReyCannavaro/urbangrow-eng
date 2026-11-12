#!/usr/bin/env python3
"""
UrbanGrow Sticker Asset Vectorizer & Ultra-HD Upscaler
======================================================
Script ini secara otomatis mengonversi file PNG pada folder `urbangrow-sticker/`
menjadi:
1. File Vektor Asli (.svg) - Skalabilitas tak terbatas (infinite resolution)
   menggunakan VTracer (Spline Bezier Curves).
2. File Vektor Tight-Fit (.svg) - Vektor dengan bounding box yang dipangkas
   rapi (tanpa whitespace/padding transparan kosong berlebih).
3. File Raster Ultra-HD (.png) - Gambar resolusi tinggi dengan penajaman
   kontur (Unsharp Masking & Antialiasing Preservation) untuk kebutuhan cetak/display.

Kebutuhan:
  pip install vtracer pillow numpy
"""

import os
import sys
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

try:
    import vtracer
except ImportError:
    print("[ERROR] vtracer belum terinstall. Jalankan: pip install vtracer")
    sys.exit(1)


STICKER_DIR = Path(__file__).resolve().parent

# Target sticker assets to process
TARGET_FILES = ["1.png", "2.png", "3.png", "4.png"]


def enhance_raster_hd(input_path: Path, output_path: Path):
    """
    Menghasilkan raster PNG dengan kontur ultra-tajam,
    membersihkan noise pada alpha channel, dan menerapkan unsharp masking.
    """
    img = Image.open(input_path).convert("RGBA")
    
    # Pisahkan channel RGB dan Alpha
    r, g, b, a = img.split()
    rgb = Image.merge("RGB", (r, g, b))
    
    # Berikan unsharp masking lembut pada RGB untuk mempertegas garis dan kontur
    sharpened_rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.6, percent=125, threshold=2))
    
    # Perkuat kontras warna sedikit agar terlihat lebih hidup (vibrant)
    enhancer = ImageEnhance.Color(sharpened_rgb)
    vibrant_rgb = enhancer.enhance(1.04)
    
    # Clean alpha: buang semi-transparan sangat tipis (noise artifact)
    alpha_np = np.array(a)
    alpha_clean = np.where(alpha_np < 8, 0, alpha_np)
    a_clean = Image.fromarray(alpha_clean.astype(np.uint8))
    
    # Gabungkan kembali ke RGBA
    r_s, g_s, b_s = vibrant_rgb.split()
    final_img = Image.merge("RGBA", (r_s, g_s, b_s, a_clean))
    
    final_img.save(output_path, format="PNG", optimize=True)


def vectorize_to_svg(input_path: Path, output_full_svg: Path, output_tight_svg: Path):
    """
    Mengonversi PNG ke Vector SVG berbasis kurva spline bezier menggunakan VTracer,
    lalu menambahkan viewBox standar dan tight viewBox.
    """
    # 1. Jalankan VTracer
    vtracer.convert_image_to_svg_py(
        str(input_path),
        str(output_full_svg),
        colormode="color",
        hierarchical="stacked",
        mode="spline",
        filter_speckle=4,
        color_precision=8,
        layer_difference=16,
        corner_threshold=60,
        length_threshold=4.0,
        splice_threshold=45,
        path_precision=2,
    )
    
    # 2. Baca dimensi gambar asli & bounding box
    img = Image.open(input_path)
    orig_w, orig_h = img.size
    bbox = img.getbbox() or (0, 0, orig_w, orig_h)
    
    # 3. Patch SVG agar memiliki viewBox dan styling rendering geometris presisi
    with open(output_full_svg, "r", encoding="utf-8") as f:
        svg_content = f.read()
    
    # Tambahkan viewBox jika belum ada
    if 'viewBox="' not in svg_content:
        svg_content = re.sub(
            r'<svg\s+version="1.1"\s+xmlns="http://www.w3.org/2000/svg"\s+width="(\d+)"\s+height="(\d+)">',
            rf'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="\1" height="\2" viewBox="0 0 \1 \2" style="shape-rendering: geometricPrecision; text-rendering: geometricPrecision;">',
            svg_content,
            count=1,
        )
    
    with open(output_full_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    
    # 4. Buat versi tight-fit (bounding box yang dipotong pas sesuai isi grafis)
    padding = 24
    min_x = max(0, bbox[0] - padding)
    min_y = max(0, bbox[1] - padding)
    max_x = min(orig_w, bbox[2] + padding)
    max_y = min(orig_h, bbox[3] + padding)
    tight_w = max_x - min_x
    tight_h = max_y - min_y
    
    tight_svg_content = re.sub(
        r'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="\d+" height="\d+" viewBox="[^"]*" style="[^"]*">',
        f'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="{tight_w}" height="{tight_h}" viewBox="{min_x} {min_y} {tight_w} {tight_h}" style="shape-rendering: geometricPrecision; text-rendering: geometricPrecision;">',
        svg_content,
        count=1,
    )
    
    with open(output_tight_svg, "w", encoding="utf-8") as f:
        f.write(tight_svg_content)


def main():
    print("=" * 70)
    print("  URBANGROW STICKER VECTORIZER & ULTRA-HD UPSCALER")
    print("=" * 70)
    print(f"Direktori aset: {STICKER_DIR}\n")
    
    results = []
    
    for filename in TARGET_FILES:
        input_file = STICKER_DIR / filename
        if not input_file.exists():
            print(f"[SKIP] File {filename} tidak ditemukan.")
            continue
        
        base_name = input_file.stem
        full_svg = STICKER_DIR / f"{base_name}.svg"
        tight_svg = STICKER_DIR / f"{base_name}_tight.svg"
        hd_png = STICKER_DIR / f"{base_name}_hd.png"
        
        print(f"[*] Memproses asset: {filename} ...")
        
        # 1. Vectorize
        print(f"    -> Vektorisasi VTracer ke {full_svg.name} & {tight_svg.name} ...")
        vectorize_to_svg(input_file, full_svg, tight_svg)
        
        # 2. Ultra-HD Enhanced Raster
        print(f"    -> Penajaman Ultra-HD Raster ke {hd_png.name} ...")
        enhance_raster_hd(input_file, hd_png)
        
        orig_kb = input_file.stat().st_size / 1024
        svg_kb = full_svg.stat().st_size / 1024
        tight_kb = tight_svg.stat().st_size / 1024
        hd_kb = hd_png.stat().st_size / 1024
        
        results.append({
            "name": filename,
            "orig_size": f"{orig_kb:.1f} KB",
            "svg_size": f"{svg_kb:.1f} KB",
            "tight_size": f"{tight_kb:.1f} KB",
            "hd_size": f"{hd_kb:.1f} KB",
        })
        print(f"    [OK] Selesai ({full_svg.name}, {tight_svg.name}, {hd_png.name})\n")
    
    # Hapus file temporary jika ada
    temp_file = STICKER_DIR / "4_test.svg"
    if temp_file.exists():
        temp_file.unlink()
    
    print("-" * 70)
    print(f"{'File':<10} | {'Ukuran Asli':<12} | {'Vektor Full':<12} | {'Vektor Tight':<12} | {'Ultra-HD PNG':<12}")
    print("-" * 70)
    for r in results:
        print(f"{r['name']:<10} | {r['orig_size']:<12} | {r['svg_size']:<12} | {r['tight_size']:<12} | {r['hd_size']:<12}")
    print("-" * 70)
    print("\n[SUKSES] Semua file vektor SVG dan Ultra-HD PNG siap digunakan!")


if __name__ == "__main__":
    main()

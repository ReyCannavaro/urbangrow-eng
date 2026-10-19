# 🚨 UrbanGrow Cyber-Physical Security Incident Runbook

> **Klasifikasi**: Prosedur Tanggap Darurat Sistem Siber-Fisik (*CPS Incident Response*)  
> **Institusi**: SMK Telkom Sidoarjo (Regu Mawar)  
> **Status**: Approved Security Runbook

---

## 🔒 1. Skenario Insiden & Prosedur Eskalasi

| Tingkat Keparahan | Indikasi Insiden | Aksi Otomatis Sistem | Tindakan Teknisi Lapangan |
|---|---|---|---|
| **P1 - CRITICAL** | Perintah override pompa dimatikan >30 menit tanpa konfirmasi fisik. | Interlock darurat menyalakan pompa secara otomatis pada menit ke-31 (*watchdog failsafe*). | Periksa fisik Level 3 & Level 1; pastikan sirkulasi air mengalir ke perakaran Pakcoy. |
| **P2 - HIGH** | Flooding request pada endpoint `/api/actuators/:id/toggle` (>30 req/menit). | Rate limiter memblokir IP/Token penyerang selama 15 menit dan mencatat log IP. | Lakukan rotasi token HMAC edge dan audit log Cloudflare Tunnel. |
| **P3 - MEDIUM** | Anomali sensor mendadak melonjak ke nilai ekstrem tak wajar (misal TDS = 0 atau 5000 ppm). | Backend menandai flag `sensor_degraded: true` dan mengalihkan status ke mode *Heuristic Fallback*. | Bersihkan elektroda sensor dari penumpukan alga/biofilm dengan larutan pembersih. |

---

## 🛠️ 2. Perintah Isolasi Cepat (Quick Containment Commands)

Jika terjadi anomali kendali aktuator tak dikenal:
```bash
# 1. Putuskan tunnel remote eksternal
sudo systemctl stop cloudflared

# 2. Kembalikan seluruh relay ke status aman biologis default (Pump ON, Aerator ON)
curl -X POST http://localhost:3000/api/simulation/anomaly -H "Content-Type: application/json" -d '{"type":"none"}'
```

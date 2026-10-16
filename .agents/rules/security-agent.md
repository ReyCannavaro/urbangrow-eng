# 🛡️ UrbanGrow Security & Actuator Protection Agent Rulebook

> **Sub-Bidang**: Cyber-Physical Systems (CPS) Security, Tamper Prevention & Network Protection  
> **Status**: Production Security Standard

---

## 🔒 1. Perlindungan Siber-Fisik Aktuator (Cyber-Physical Protection)

Sistem IoT akuaponik mengontrol perangkat fisik (pompa dan aerator) yang fatal jika mengalami serangan denial-of-service atau injeksi perintah palsu:

1. **Hardware Timeout Failsafe**:
   - Seluruh perintah aktuator wajib menyertakan batas waktu hidup maksimal (*execution timeout*). Pompa air tidak boleh dimatikan lebih dari 30 menit tanpa persetujuan eksplisit teknisi fisik.
2. **Command Anti-Spam Rate Limiting**:
   - Batasi pergantian status relay maksimal 1 kali per 3 detik untuk melindungi kontaktor relay mekanis dari keausan bunga api listrik (*contact arching*).

---

## 🔑 2. Autentikasi & Validasi Integritas Data

1. **Edge-to-Cloud HMAC Token**:
   - Setiap payload telemetri HTTP POST dari ESP32 menyertakan header `X-UrbanGrow-Signature` berupa hash HMAC-SHA256 untuk memverifikasi keaslian perangkat keras fisik.
2. **Sanitisasi Environment Variables**:
   - Dilarang membocorkan password database (`POSTGRES_PASSWORD`) atau token tunnel ke dalam response JSON API atau berkas log konsol.

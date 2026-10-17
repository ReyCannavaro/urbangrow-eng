# 🚀 UrbanGrow Edge Deployment Runbook

> **Target Platform**: Raspberry Pi 5 / Mini PC (Intel N100 / AMD Ryzen)  
> **Sistem Operasi**: Ubuntu Server 24.04 LTS (64-bit ARM64 / x86_64)  
> **Status**: Approved Production Runbook

---

## 🛠️ 1. Persiapan Sistem Operasi Edge

```bash
# 1. Update paket sistem
sudo apt update && sudo apt upgrade -y

# 2. Instalasi Docker Engine & Compose plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Instalasi Bun Runtime
curl -fsSL https://bun.sh/install | bash
```

---

## 📦 2. Deployment Stack Kontainer

```bash
# Clone repositori ke direktori /opt/urbangrow
sudo git clone https://github.com/ReyCannavaro/urbangrow-eng.git /opt/urbangrow
cd /opt/urbangrow

# Jalankan stack Docker Compose
docker compose up -d

# Periksa status kesehatan kontainer
docker compose ps
```

---

## 🌐 3. Konfigurasi Cloudflare Tunnel (Remote Access)

Untuk mengakses dashboard web dan API dari luar jaringan Wi-Fi lokal tanpa port-forwarding:
```bash
# Jalankan koneksi tunnel aman
cloudflared tunnel run urbangrow-edge
```

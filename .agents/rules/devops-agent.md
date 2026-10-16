# 🚀 UrbanGrow DevOps, Monorepo & Infrastructure Agent Specification

> **Sub-Bidang**: Monorepo Orchestration, Containerization, CI/CD & Edge Deployment  
> **Teknologi**: Moonrepo v2, Docker & Docker Compose, GitHub Actions, Cloudflare Tunnel  
> **Status**: Production Reference Standard

---

## 🛠️ 1. Moonrepo v2 Monorepo Orchestration

Moonrepo mengelola dependensi dan task graph di seluruh sub-project monorepo:

```bash
# Menjalankan seluruh layanan secara paralel dalam mode development
moon run :dev

# Membangun seluruh proyek dengan intelligent remote/local cache
moon run :build

# Menjalankan linter di seluruh apps dan services
moon run :lint
```

### Konfigurasi Target Project:
- `backend`: `services/backend` (Bun + Elysia)
- `web`: `apps/web` (Next.js 16)
- `mobile`: `apps/mobile` (Flutter 3)
- `ai-engine`: `services/ai-engine` (Python FastAPI)
- `simulator`: `apps/iot-simulator` (Vite React)

---

## 🐳 2. Arsitektur Docker Compose Multi-Service

Untuk lingkungan pengujian lokal terintegrasi dan deployment edge (Raspberry Pi 5 / Mini PC):

```yaml
version: '3.8'

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: urbangrow
      POSTGRES_USER: urbangrow_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD:-urbangrow_secret_2026}
    volumes:
      - timescale_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U urbangrow_admin -d urbangrow"]
      interval: 10s
      timeout: 5s
      retries: 5

  mosquitto:
    image: eclipse-mosquitto:2.0
    restart: unless-stopped
    ports:
      - "1883:1883"
    volumes:
      - ./docker/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf

  backend:
    build:
      context: ./services/backend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://urbangrow_admin:${DB_PASSWORD:-urbangrow_secret_2026}@timescaledb:5432/urbangrow
      MQTT_BROKER_URL: mqtt://mosquitto:1883
    depends_on:
      timescaledb:
        condition: service_healthy
      mosquitto:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 15s
      timeout: 5s
      retries: 3

  ai-engine:
    build:
      context: ./services/ai-engine
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8000:8000"
    depends_on:
      - backend

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3000

volumes:
  timescale_data:
```

---

## 🔒 3. Edge Deployment & Cloudflare Tunnel

Untuk akses mobile jarak jauh tanpa IP publik statis:
- Gunakan `cloudflared` tunnel yang menghubungkan port lokal 3000 ke domain terenkripsi TLS.
- Selalu simpan token otorisasi di berkas `.env.production` yang tidak boleh di-commit ke Git repo.

---

## 📦 4. Standar Multi-Stage Dockerfile (Minimal Footprint)

Untuk menjaga image size di bawah 100MB pada board ARM64 Raspberry Pi:

```dockerfile
# Contoh Multi-stage Dockerfile untuk Backend Elysia
FROM oven/bun:1.3-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY src ./src

FROM oven/bun:1.3-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
USER bun
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

---

## ⚙️ 5. Edge Systemd Service (Auto-Start Pasca Mati Lampu)

Jika server mini PC atau Raspberry Pi mengalami siklus mati daya dan menyala kembali:
```ini
[Unit]
Description=UrbanGrow Edge Docker Compose Stack
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/urbangrow
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

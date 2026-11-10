#!/usr/bin/env bash
set -euo pipefail

# UrbanGrow Backend Ubuntu 24.04 EC2 Setup Script
# Usage: sudo bash setup-ec2.sh urbangrow-api.reycannavaro.dev

DOMAIN="${1:-urbangrow-api.reycannavaro.dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_USER="${SUDO_USER:-$(whoami)}"
if [[ "${APP_USER}" == "root" ]] && id -u ubuntu >/dev/null 2>&1; then
  APP_USER="ubuntu"
fi
APP_GROUP="$(id -gn "${APP_USER}")"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Harap jalankan dengan sudo: sudo bash $0 ${DOMAIN}"
  exit 1
fi

echo "==> [1/6] Memasang dependensi sistem & Caddy untuk HTTPS (${DOMAIN})..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl git unzip

if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  chmod o+r /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> [2/6] Memasang Bun runtime secara global di /usr/local/bin/bun..."
if [[ ! -x /usr/local/bin/bun ]]; then
  curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash
fi
chmod 755 /usr/local/bin/bun
/usr/local/bin/bun --version

echo "==> [3/6] Memasang dependensi backend di ${BACKEND_DIR}..."
chown -R "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}"
cd "${BACKEND_DIR}"
if [[ -f "${BACKEND_DIR}/bun.lock" ]]; then
  su -s /bin/bash "${APP_USER}" -c "cd '${BACKEND_DIR}' && /usr/local/bin/bun install --frozen-lockfile --production" || \
    su -s /bin/bash "${APP_USER}" -c "cd '${BACKEND_DIR}' && /usr/local/bin/bun install --production"
else
  su -s /bin/bash "${APP_USER}" -c "cd '${BACKEND_DIR}' && /usr/local/bin/bun install --production"
fi

echo "==> [4/6] Menyiapkan file .env backend..."
if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
  chown "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}/.env"
  chmod 600 "${BACKEND_DIR}/.env"
  NEEDS_ENV_EDIT=1
else
  chown "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}/.env"
  chmod 600 "${BACKEND_DIR}/.env"
  NEEDS_ENV_EDIT=0
fi

if grep -q "your_gemini_api_key_here" "${BACKEND_DIR}/.env" || ! grep -q "^GEMINI_API_KEY=.\+" "${BACKEND_DIR}/.env"; then
  NEEDS_ENV_EDIT=1
fi

echo "==> [5/6] Mendaftarkan systemd service urbangrow-backend..."
cat >/etc/systemd/system/urbangrow-backend.service <<EOF
[Unit]
Description=UrbanGrow ElysiaJS IoT & Gemini AI Backend
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${BACKEND_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=${BACKEND_DIR}/.env
ExecStart=/usr/local/bin/bun run src/index.ts
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable urbangrow-backend
systemctl restart urbangrow-backend

echo "==> [6/6] Mengonfigurasi Caddy reverse proxy + HTTPS otomatis untuk ${DOMAIN}..."
cat >/etc/caddy/Caddyfile <<EOF
${DOMAIN} {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
EOF

caddy validate --config /etc/caddy/Caddyfile
systemctl enable caddy
systemctl restart caddy

sleep 2
echo ""
echo "=== STATUS LAYANAN ==="
systemctl --no-pager --lines=5 status urbangrow-backend || true
echo ""
echo "=== UJI HEALTH CHECK LOKAL ==="
curl -fsS http://127.0.0.1:3000/health && echo ""

echo ""
echo "================================================================="
echo "Setup selesai!"
echo "- Endpoint HTTPS target : https://${DOMAIN}/health"
echo "- Cek log backend       : sudo journalctl -u urbangrow-backend -f"
echo "- Cek log HTTPS Caddy   : sudo journalctl -u caddy -f"
if [[ "${NEEDS_ENV_EDIT}" -eq 1 ]]; then
  echo ""
  echo "PENTING: GEMINI_API_KEY di ${BACKEND_DIR}/.env masih placeholder/kosong!"
  echo "Jalankan:"
  echo "  nano ${BACKEND_DIR}/.env"
  echo "Lalu isi GEMINI_API_KEY=AIzaSy... dan restart service:"
  echo "  sudo systemctl restart urbangrow-backend"
fi
echo "================================================================="

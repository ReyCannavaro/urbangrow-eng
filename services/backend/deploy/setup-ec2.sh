#!/usr/bin/env bash
set -euo pipefail

# UrbanGrow Backend Ubuntu EC2 Setup Script (Zero-apt hang resilient)
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

ARCH_RAW="$(uname -m)"
case "${ARCH_RAW}" in
  x86_64|amd64)
    GO_ARCH="amd64"
    BUN_ARCH="x64"
    ;;
  aarch64|arm64)
    GO_ARCH="arm64"
    BUN_ARCH="aarch64"
    ;;
  *)
    echo "Arsitektur CPU tidak didukung: ${ARCH_RAW}"
    exit 1
    ;;
esac

echo "==> [1/6] Memastikan utilitas dasar tersedia (${ARCH_RAW})..."
for req in curl git python3 systemctl; do
  if ! command -v "${req}" >/dev/null 2>&1; then
    echo "Utilitas ${req} tidak ditemukan, memasang via apt..."
    DEBIAN_FRONTEND=noninteractive apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get install -y curl git python3
    break
  fi
done

echo "==> [2/6] Memasang Bun runtime secara global di /usr/local/bin/bun..."
if [[ ! -x /usr/local/bin/bun ]]; then
  TMP_BUN_ZIP="/tmp/bun-linux-${BUN_ARCH}.zip"
  curl -fsSL "https://github.com/oven-sh/bun/releases/latest/download/bun-linux-${BUN_ARCH}.zip" -o "${TMP_BUN_ZIP}"
  python3 - "${TMP_BUN_ZIP}" /usr/local/bin/bun <<'PYEOF'
import sys, zipfile, shutil
zip_path, out_path = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(zip_path, "r") as zf:
    match = [n for n in zf.namelist() if n.endswith("/bun") or n == "bun"]
    if not match:
        raise RuntimeError(f"bun binary not found inside {zip_path}: {zf.namelist()}")
    with zf.open(match[0]) as src, open(out_path, "wb") as dst:
        shutil.copyfileobj(src, dst)
PYEOF
  rm -f "${TMP_BUN_ZIP}"
  chmod 755 /usr/local/bin/bun
fi
/usr/local/bin/bun --version

echo "==> [3/6] Memasang Caddy reverse proxy untuk HTTPS otomatis (${DOMAIN})..."
CADDY_BIN="$(command -v caddy || true)"
if [[ -z "${CADDY_BIN}" ]]; then
  CADDY_BIN="/usr/local/bin/caddy"
  curl -fsSL "https://caddyserver.com/api/download?os=linux&arch=${GO_ARCH}" -o "${CADDY_BIN}"
  chmod 755 "${CADDY_BIN}"
fi
if command -v setcap >/dev/null 2>&1; then
  setcap cap_net_bind_service=+ep "${CADDY_BIN}" || true
fi
"${CADDY_BIN}" version

if ! getent group caddy >/dev/null 2>&1; then
  groupadd --system caddy
fi
if ! id -u caddy >/dev/null 2>&1; then
  useradd --system --gid caddy --create-home --home-dir /var/lib/caddy --shell /usr/sbin/nologin caddy
fi
mkdir -p /etc/caddy /var/lib/caddy /var/log/caddy
chown -R caddy:caddy /etc/caddy /var/lib/caddy /var/log/caddy

if [[ ! -f /etc/systemd/system/caddy.service && ! -f /lib/systemd/system/caddy.service ]]; then
  cat >/etc/systemd/system/caddy.service <<EOF
[Unit]
Description=Caddy Reverse Proxy (UrbanGrow HTTPS)
Documentation=https://caddyserver.com/docs/
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
Environment=HOME=/var/lib/caddy
Environment=XDG_DATA_HOME=/var/lib/caddy
Environment=XDG_CONFIG_HOME=/etc/caddy
ExecStart=${CADDY_BIN} run --environ --config /etc/caddy/Caddyfile
ExecReload=${CADDY_BIN} reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF
fi

echo "==> [4/6] Memasang dependensi backend di ${BACKEND_DIR}..."
chown -R "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}"
if [[ -f "${BACKEND_DIR}/bun.lock" ]]; then
  su -s /bin/bash "${APP_USER}" -c "cd '${BACKEND_DIR}' && /usr/local/bin/bun install --frozen-lockfile --production" || \
    su -s /bin/bash "${APP_USER}" -c "cd '${BACKEND_DIR}' && /usr/local/bin/bun install --production"
else
  su -s /bin/bash "${APP_USER}" -c "cd '${BACKEND_DIR}' && /usr/local/bin/bun install --production"
fi

echo "==> [5/6] Memeriksa file .env backend..."
if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
  NEEDS_ENV_EDIT=1
else
  NEEDS_ENV_EDIT=0
fi
chown "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}/.env"
chmod 600 "${BACKEND_DIR}/.env"
sed -i 's/\r$//' "${BACKEND_DIR}/.env"

if grep -q "your_gemini_api_key_here" "${BACKEND_DIR}/.env" || ! grep -q "^GEMINI_API_KEY=.\+" "${BACKEND_DIR}/.env"; then
  NEEDS_ENV_EDIT=1
fi

echo "==> [6/6] Mengonfigurasi systemd urbangrow-backend & Caddy HTTPS..."
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

cat >/etc/caddy/Caddyfile <<EOF
${DOMAIN} {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
EOF
chown caddy:caddy /etc/caddy/Caddyfile

"${CADDY_BIN}" validate --config /etc/caddy/Caddyfile
systemctl daemon-reload
systemctl enable urbangrow-backend caddy
systemctl restart urbangrow-backend
systemctl restart caddy

sleep 2
echo ""
echo "=== STATUS LAYANAN ==="
systemctl --no-pager --lines=5 status urbangrow-backend || true
systemctl --no-pager --lines=5 status caddy || true
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
  echo "Jalankan: nano ${BACKEND_DIR}/.env && sudo systemctl restart urbangrow-backend"
fi
echo "================================================================="

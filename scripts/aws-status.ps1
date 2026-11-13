# UrbanGrow AWS EC2 Production Status Checker & Remote Terminal
param(
    [switch]$Logs,
    [switch]$Ssh,
    [switch]$PullDb
)

$EC2_HOST = "15.135.131.72"
$EC2_USER = "ubuntu"
$KEY_PATH = "$HOME\.ssh\urbangrow-backend.pem"
$API_URL  = "https://urbangrow-api.reycannavaro.dev/health"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  UrbanGrow AWS EC2 Production Manager" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Mode: Direct SSH Login
if ($Ssh) {
    Write-Host "[SSH] Menghubungkan ke terminal AWS EC2 ($EC2_USER@$EC2_HOST)..." -ForegroundColor Yellow
    ssh -i $KEY_PATH -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST"
    exit
}

# 2. Mode: Live Log Stream
if ($Logs) {
    Write-Host "[LOGS] Mengalirkan log server realtime (Tekan Ctrl+C untuk keluar)..." -ForegroundColor Yellow
    ssh -i $KEY_PATH -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "sudo journalctl -u urbangrow-backend -f"
    exit
}

# 3. Mode: Pull DB
if ($PullDb) {
    $target = "services\backend\data\urbangrow-production.sqlite"
    Write-Host "[DB] Mengunduh database SQLite terbaru dari AWS EC2..." -ForegroundColor Yellow

    # Cek apakah file sedang dikunci oleh DBeaver
    if (Test-Path $target) {
        $fileLocked = $false
        try {
            $stream = [System.IO.File]::Open($target, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
            $stream.Close()
        } catch {
            $fileLocked = $true
        }

        if ($fileLocked) {
            Write-Host "`n[PERINGATAN] File database sedang dibuka/dikunci oleh DBeaver!" -ForegroundColor Red
            Write-Host "Solusi: Di DBeaver, klik kanan koneksi database -> pilih 'Disconnect' (atau tutup tab tabel yang sedang terbuka)." -ForegroundColor Yellow
            Write-Host "Setelah itu, jalankan kembali perintah ini:`n  powershell .\scripts\aws-status.ps1 -PullDb`n" -ForegroundColor Cyan
            exit 1
        }
    }

    scp -i $KEY_PATH -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}:/home/ubuntu/urbangrow-eng/services/backend/data/urbangrow.sqlite" $target
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database berhasil diunduh ke $target!" -ForegroundColor Green
        Write-Host "Silakan buka kembali atau refresh (F5) di DBeaver." -ForegroundColor Cyan
    } else {
        Write-Host "[GAGAL] scp gagal mengunduh database." -ForegroundColor Red
    }
    exit
}

# Default: Cek Health & Service Status
Write-Host "`n1. 🌐 Public API Health Check ($API_URL):" -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri $API_URL -TimeoutSec 5
    Write-Host "   Status   : $($resp.status.ToUpper())" -ForegroundColor Green
    Write-Host "   Service  : $($resp.service)" -ForegroundColor White
    Write-Host "   Uptime   : $([math]::Round($resp.uptimeSeconds / 3600, 2)) jam" -ForegroundColor White
    Write-Host "   Database : $($resp.database.engine) ($($resp.database.persistedReadingsCount) sensor rows, $($resp.database.cohortAuditCount) cohort audits)" -ForegroundColor White
} catch {
    Write-Host "   [GAGAL] API tidak merespons: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. ⚡ AWS EC2 Systemd Service Status (urbangrow-backend):" -ForegroundColor Yellow
ssh -i $KEY_PATH -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "sudo systemctl status urbangrow-backend --no-pager"

Write-Host "`n-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Pintasan Tambahan:" -ForegroundColor Gray
Write-Host "  - Masuk ke terminal AWS: powershell .\scripts\aws-status.ps1 -Ssh" -ForegroundColor Cyan
Write-Host "  - Nonton log realtime  : powershell .\scripts\aws-status.ps1 -Logs" -ForegroundColor Cyan
Write-Host "  - Unduh database terbaru: powershell .\scripts\aws-status.ps1 -PullDb" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------`n" -ForegroundColor Cyan

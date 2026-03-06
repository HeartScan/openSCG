# DevOps Safe Start Script for Windows
$ErrorActionPreference = "Continue"

Write-Host "Cleaning up Next.js locks and build artifacts..." -ForegroundColor Cyan
Remove-Item -Path ".next\dev\lock" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force -Path ".next\cache" -ErrorAction SilentlyContinue

Write-Host "Checking for port 3000..." -ForegroundColor Cyan
$portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($portProcess) {
    Write-Host "Process $portProcess is using port 3000. Server will automatically try 3001." -ForegroundColor Yellow
}

Write-Host "Starting server in local-only mode (NO_REDIS=true)..." -ForegroundColor Green
$env:NO_REDIS = "true"
node server.js

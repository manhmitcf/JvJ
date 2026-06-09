# Script chay Docker cho JvJ Project
# Su dung: .\docker-run.ps1
# Chay tu root folder cua project

Write-Host "=== STOPPING & CLEANING OLD CONTAINERS ===" -ForegroundColor Cyan

# Stop va remove containers cu
Write-Host "Cleaning containers..." -ForegroundColor Yellow
docker stop jvj-backend jvj-frontend 2>$null
docker rm jvj-backend jvj-frontend 2>$null

# Clean dangling images
Write-Host "Cleaning dangling images..." -ForegroundColor Yellow
docker image prune -f 2>$null

Write-Host ""
Write-Host "=== BUILDING & RUNNING BACKEND ===" -ForegroundColor Cyan

# Dam bao folder media-uploads ton tai
$mediaPath = Join-Path $PSScriptRoot "media-uploads"
New-Item -ItemType Directory -Path $mediaPath -Force | Out-Null
Write-Host "Media uploads folder: $mediaPath" -ForegroundColor Gray

Set-Location backend

# Build backend image
Write-Host "Building backend image..." -ForegroundColor Yellow
docker build -t jvj-backend:latest .

# Run backend container
Write-Host "Starting backend container..." -ForegroundColor Yellow
docker run -d `
  --name jvj-backend `
  -p 8000:8000 `
  -v "${PSScriptRoot}\media-uploads:/app/media" `
  --env-file ../.env `
  jvj-backend:latest

Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Verify backend
Write-Host "Verifying backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/login/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Backend failed - checking logs..." -ForegroundColor Red
    docker logs jvj-backend --tail 30
}

Write-Host ""
Write-Host "=== BUILDING & RUNNING FRONTEND ===" -ForegroundColor Cyan
Set-Location ..\frontend

# Build frontend image
Write-Host "Building frontend image..." -ForegroundColor Yellow
docker build -t jvj-frontend:latest .

# Run frontend container voi volume mount cho hot reload
Write-Host "Starting frontend container..." -ForegroundColor Yellow
docker run -d `
  --name jvj-frontend `
  -p 5173:5173 `
  -v "${PWD}/src:/app/src" `
  --env-file ../.env `
  jvj-frontend:latest

Write-Host "Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify frontend
Write-Host "Verifying frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Frontend OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Frontend failed - checking logs..." -ForegroundColor Red
    docker logs jvj-frontend --tail 30
}

Write-Host ""
Write-Host "=== CONTAINERS STATUS ===" -ForegroundColor Cyan
docker ps --filter "name=jvj-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Yellow
Write-Host "  Logs:     docker logs jvj-backend -f" -ForegroundColor Gray
Write-Host "            docker logs jvj-frontend -f" -ForegroundColor Gray
Write-Host "  Stop:     docker stop jvj-backend jvj-frontend" -ForegroundColor Gray
Write-Host "  Remove:   docker rm jvj-backend jvj-frontend" -ForegroundColor Gray
Write-Host "  Restart:  docker restart jvj-backend jvj-frontend" -ForegroundColor Gray

Set-Location ..

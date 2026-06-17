# Script chay Docker cho JvJ Project
# Su dung: .\docker-run.ps1
# Chay tu root folder cua project

function Wait-ForHttpReady {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSeconds = 30,
        [int]$IntervalSeconds = 2
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        $isRunning = docker inspect -f "{{.State.Running}}" $Name 2>$null
        if ($LASTEXITCODE -ne 0 -or $isRunning -ne "true") {
            Write-Host "$Name container da dung - checking logs..." -ForegroundColor Red
            docker logs $Name --tail 50
            return $false
        }

        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            Write-Host "$Name OK (Status: $($response.StatusCode))" -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Seconds $IntervalSeconds
        }
    }

    Write-Host "$Name chua san sang sau $TimeoutSeconds giay - checking logs..." -ForegroundColor Red
    docker logs $Name --tail 50
    return $false
}

Write-Host "=== STOPPING & CLEANING OLD CONTAINERS ===" -ForegroundColor Cyan

# Stop va remove containers cu
Write-Host "Cleaning containers..." -ForegroundColor Yellow
docker stop jvj-backend jvj-frontend 2>$null
docker rm jvj-backend jvj-frontend 2>$null

# Remove old network if exists
docker network rm jvj-network 2>$null

# Clean dangling images
Write-Host "Cleaning dangling images..." -ForegroundColor Yellow
docker image prune -f 2>$null

# Create shared network
Write-Host "Creating shared Docker network..." -ForegroundColor Yellow
docker network create --driver bridge jvj-network 2>$null

# Patch VITE_API_BASE_URL in frontend source before build
Write-Host "Patching VITE_API_BASE_URL in frontend source..." -ForegroundColor Yellow
$frontendApiClientPath = Join-Path $PSScriptRoot "frontend\src\lib\api-client.ts"
$apiClientContent = Get-Content $frontendApiClientPath -Raw
$patchedContent = $apiClientContent -replace 'const API_BASE_URL = import\.meta\.env\.VITE_API_BASE_URL \|\|"[^"]*"', 'const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://host.docker.internal:8000/api/v1"'
Set-Content -Path $frontendApiClientPath -Value $patchedContent -NoNewline

Write-Host ""
Write-Host "=== BUILDING & RUNNING BACKEND ===" -ForegroundColor Cyan

# Dam bao folder media-uploads ton tai
$mediaPath = Join-Path $PSScriptRoot "media-uploads"
New-Item -ItemType Directory -Path $mediaPath -Force | Out-Null
Write-Host "Media uploads folder: $mediaPath" -ForegroundColor Gray

Push-Location (Join-Path $PSScriptRoot "backend")

# Build backend image
Write-Host "Building backend image..." -ForegroundColor Yellow
docker build -t jvj-backend:latest .
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Build backend that bai"
}

# Run backend container on shared network
Write-Host "Starting backend container..." -ForegroundColor Yellow
docker run -d `
  --name jvj-backend `
  --network jvj-network `
  -p 8000:8000 `
  -v "${PSScriptRoot}\media-uploads:/app/media" `
  --env-file ../.env `
  jvj-backend:latest
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Start backend container that bai"
}

Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Write-Host "Verifying backend..." -ForegroundColor Yellow
Wait-ForHttpReady -Name "jvj-backend" -Url "http://localhost:8000/admin/login/" -TimeoutSeconds 45 | Out-Null

Pop-Location

Write-Host ""
Write-Host "=== BUILDING & RUNNING FRONTEND ===" -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "frontend")

# Build frontend image (source already patched above)
Write-Host "Building frontend image..." -ForegroundColor Yellow
docker build -t jvj-frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Build frontend that bai"
}

# Run frontend container on shared network
# NOTE: Do NOT pass --env-file here — .env may override VITE_API_BASE_URL.
# The correct value is already baked into the Vite bundle via the patch above.
Write-Host "Starting frontend container..." -ForegroundColor Yellow
docker run -d `
  --name jvj-frontend `
  --network jvj-network `
  -p 5173:5173 `
  -v "${PWD}\src:/app/src" `
  jvj-frontend:latest
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Start frontend container that bai"
}

Write-Host "Waiting for frontend to initialize..." -ForegroundColor Yellow
Write-Host "Verifying frontend..." -ForegroundColor Yellow
Wait-ForHttpReady -Name "jvj-frontend" -Url "http://localhost:5173/" -TimeoutSeconds 45 | Out-Null

Pop-Location

# Restore api-client.ts to original state
$restoredContent = $apiClientContent
Set-Content -Path $frontendApiClientPath -Value $restoredContent -NoNewline
Write-Host "Restored api-client.ts to original state." -ForegroundColor Gray

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
Write-Host "  Restart:  .\docker-run.ps1" -ForegroundColor Gray

Set-Location $PSScriptRoot

#!/bin/bash
# Script chạy Docker chuẩn cho JvJ Project
# Sử dụng: bash docker-run.sh
# Chạy từ root folder của project

set -e

echo "=== STOPPING & CLEANING OLD CONTAINERS & IMAGES ==="

# Backend
echo "Cleaning backend..."
docker stop jvj-backend 2>/dev/null || true
docker rm jvj-backend 2>/dev/null || true
docker stop backend-backend-1 2>/dev/null || true
docker rm backend-backend-1 2>/dev/null || true
docker rmi jvj-backend:latest 2>/dev/null || true
docker rmi backend-backend:latest 2>/dev/null || true

# Frontend
echo "Cleaning frontend..."
docker stop jvj-frontend 2>/dev/null || true
docker rm jvj-frontend 2>/dev/null || true
docker stop frontend-frontend-1 2>/dev/null || true
docker rm frontend-frontend-1 2>/dev/null || true
docker rmi jvj-frontend:latest 2>/dev/null || true
docker rmi frontend-frontend:latest 2>/dev/null || true

# Clean dangling images
echo "Cleaning dangling images..."
docker image prune -f 2>/dev/null || true

echo ""
echo "=== BUILDING & RUNNING BACKEND ==="
cd backend

# Đảm bảo folder media tồn tại
mkdir -p media/uploads

# Build backend image
echo "Building backend image..."
docker build -t jvj-backend:latest .

# Run backend container
echo "Starting backend container..."
docker run -d \
  --name jvj-backend \
  -p 8000:8000 \
  -v "$(pwd):/app" \
  --env-file .env.docker \
  jvj-backend:latest

echo "Waiting for backend to start..."
sleep 8

# Verify backend
echo "Verifying backend..."
if curl -f http://localhost:8000/api/v1/auth/login/ 2>/dev/null >/dev/null; then
    echo "✅ Backend OK"
else
    echo "❌ Backend failed - checking logs..."
    docker logs jvj-backend --tail 20
fi

echo ""
echo "=== BUILDING & RUNNING FRONTEND ==="
cd ../frontend

# Build frontend image
echo "Building frontend image..."
docker build -t jvj-frontend:latest .

# Run frontend container
echo "Starting frontend container..."
docker run -d \
  --name jvj-frontend \
  -p 5173:5173 \
  -v "$(pwd)/src:/app/src" \
  --env-file ../.env \
  -e VITE_ENV_DIR=. \
  jvj-frontend:latest

echo "Waiting for frontend to start..."
sleep 5

# Verify frontend
echo "Verifying frontend..."
if curl -f http://localhost:5173/ 2>/dev/null >/dev/null; then
    echo "✅ Frontend OK"
else
    echo "❌ Frontend failed - checking logs..."
    docker logs jvj-frontend --tail 20
fi

echo ""
echo "=== CONTAINERS STATUS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== ✅ DONE ==="
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Logs:"
echo "  docker logs jvj-backend -f"
echo "  docker logs jvj-frontend -f"

cd ..

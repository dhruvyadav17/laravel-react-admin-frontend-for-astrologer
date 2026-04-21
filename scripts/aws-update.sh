#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  AWS rolling update (run after pushing new code)
# ─────────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
cd "$ROOT"

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding React (production)..."
VITE_API_URL=$(grep VITE_API_URL frontend/.env.aws | cut -d= -f2)
cd frontend && npm ci --production=false && VITE_API_URL="$VITE_API_URL" npm run build && cd ..

echo "Rebuilding backend image..."
cd backend
docker build \
  --target production \
  -f docker/php/Dockerfile \
  -t astro_backend:latest .
cd ..

echo "Rolling restart (backend only — no downtime)..."
docker compose -f docker-compose.aws.yml up -d --no-deps --force-recreate backend

echo "Restarting queue + scheduler..."
docker compose -f docker-compose.aws.yml restart queue scheduler

echo "Running migrations..."
docker compose -f docker-compose.aws.yml exec backend php artisan migrate --force

echo "Reloading nginx..."
docker compose -f docker-compose.aws.yml exec nginx nginx -s reload

echo "Done. $(date)"

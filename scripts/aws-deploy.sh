#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  AWS first-time deploy
#  Run on EC2 after cloning the repo
#
#  Before running:
#    1. Fill backend/.env.aws with RDS endpoint and passwords
#    2. Ensure RDS security group allows EC2 → port 3306
# ─────────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
cd "$ROOT"

# Validate .env.aws exists
if [ ! -f backend/.env.aws ]; then
  echo "ERROR: backend/.env.aws not found. Copy backend/.env.aws and fill in RDS credentials."
  exit 1
fi

echo "Step 1: Copying docker config files..."
bash scripts/copy-docker-files.sh

echo "Step 2: Building React frontend (production)..."
VITE_API_URL=$(grep VITE_API_URL frontend/.env.aws | cut -d= -f2)
cd frontend && npm ci --production=false && VITE_API_URL="$VITE_API_URL" npm run build && cd ..

echo "Step 3: Building backend production image..."
cd backend
docker build \
  --target production \
  -f docker/php/Dockerfile \
  -t astro_backend:latest .
cd ..

echo "Step 4: Starting AWS stack..."
docker compose -f docker-compose.aws.yml --env-file backend/.env.aws up -d

echo "Step 5: Running migrations..."
docker compose -f docker-compose.aws.yml exec backend \
  php artisan migrate --force

echo "Step 6: Creating storage symlink..."
docker compose -f docker-compose.aws.yml exec backend \
  php artisan storage:link

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " AWS Deploy complete!"
echo " Check status: docker compose -f docker-compose.aws.yml ps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

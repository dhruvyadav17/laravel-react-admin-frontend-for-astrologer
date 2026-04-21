#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  LOCAL first-time setup
#  Run once: bash scripts/local-setup.sh
# ─────────────────────────────────────────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
cd "$ROOT"

echo "Step 1: Copying docker config files into build contexts..."
bash scripts/copy-docker-files.sh

echo "Step 2: Copying env files..."
cp backend/.env.local  backend/.env
cp frontend/.env.local frontend/.env

echo "Step 3: Building images..."
docker compose build

echo "Step 4: Starting containers..."
docker compose up -d

echo "Step 5: Waiting for MySQL (up to 60s)..."
for i in $(seq 1 12); do
  if docker compose exec mysql mysqladmin ping -h 127.0.0.1 -u root -prootpass --silent 2>/dev/null; then
    echo "MySQL ready."
    break
  fi
  echo "  Waiting... ($((i*5))s)"
  sleep 5
done

echo "Step 6: Generating app key..."
docker compose exec backend php artisan key:generate

echo "Step 7: Running migrations and seeders..."
docker compose exec backend php artisan migrate --seed

echo "Step 8: Creating storage symlink..."
docker compose exec backend php artisan storage:link

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Setup complete!"
echo " App:     http://localhost"
echo " API:     http://localhost/api/v1"
echo " MySQL:   localhost:3306  (user: astro_user / secret)"
echo " Redis:   localhost:6379"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

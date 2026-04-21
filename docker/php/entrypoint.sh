#!/bin/sh
# Runs at container start in production.
# Caches config/routes AFTER container boots (so env vars are available).
set -e

echo "[entrypoint] Running Laravel bootstrap..."

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "[entrypoint] Bootstrap complete. Starting PHP-FPM..."
exec "$@"

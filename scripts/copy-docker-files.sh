#!/bin/bash
# Copies docker config files into the backend and frontend directories
# Run once after cloning: bash scripts/copy-docker-files.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "Copying PHP docker files into backend/docker/php/ ..."
mkdir -p "$ROOT/backend/docker/php"
cp "$SCRIPT_DIR/../docker/php/php-local.ini"  "$ROOT/backend/docker/php/"
cp "$SCRIPT_DIR/../docker/php/php-prod.ini"   "$ROOT/backend/docker/php/"
cp "$SCRIPT_DIR/../docker/php/opcache.ini"    "$ROOT/backend/docker/php/"
cp "$SCRIPT_DIR/../docker/php/xdebug.ini"     "$ROOT/backend/docker/php/"
cp "$SCRIPT_DIR/../docker/php/entrypoint.sh"  "$ROOT/backend/docker/php/"
cp "$SCRIPT_DIR/../docker/php/Dockerfile"     "$ROOT/backend/docker/php/Dockerfile"
chmod +x "$ROOT/backend/docker/php/entrypoint.sh"

echo "Copying Node docker files into frontend/docker/node/ ..."
mkdir -p "$ROOT/frontend/docker/node"
cp "$SCRIPT_DIR/../docker/node/Dockerfile" "$ROOT/frontend/docker/node/Dockerfile"

echo "Done. Files are in place for docker builds."

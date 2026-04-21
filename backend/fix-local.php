<?php
/**
 * fix-local.php — Run this ONCE if you see Redis connection errors on XAMPP.
 * 
 * Usage: php fix-local.php
 * 
 * What it does:
 *   1. Deletes bootstrap/cache/config.php (stale cached config with Redis settings)
 *   2. Deletes bootstrap/cache/routes*.php
 *   3. Reminds you to run: php artisan config:clear && php artisan cache:clear
 */

$cacheDir = __DIR__ . '/bootstrap/cache/';

$deleted = [];
foreach (glob($cacheDir . '*.php') as $file) {
    if (basename($file) === 'packages.php' || basename($file) === 'services.php') {
        continue; // Keep these — they're package discovery cache
    }
    if (@unlink($file)) {
        $deleted[] = basename($file);
    }
}

if ($deleted) {
    echo "✓ Deleted stale cache files:\n";
    foreach ($deleted as $f) echo "  - bootstrap/cache/$f\n";
} else {
    echo "✓ No stale cache files found — already clean.\n";
}

echo "\nNext steps:\n";
echo "  php artisan config:clear\n";
echo "  php artisan cache:clear\n";
echo "  php artisan serve\n";

# Backend Setup

## Requirements
- PHP 8.2+
- MySQL 8.0+
- Composer

## Steps

```bash
# 1. Copy env
cp .env.example .env

# 2. Install dependencies
composer install

# 3. Generate app key
php artisan key:generate

# 4. Create MySQL database
# In MySQL: CREATE DATABASE astrologer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 5. Run migrations + seeders
php artisan migrate --seed

# 6. Start server
php artisan serve
```

## Common Issues

**"Database file does not exist"** — means DB_CONNECTION fell back to sqlite.
Make sure .env has `DB_CONNECTION=mysql` and your MySQL credentials are correct.

**"PSR-4 autoloading" warnings on composer install** — fixed in this version.
If you see them, run `composer dump-autoload` after `composer install`.

# 🔭 Astro Platform — Complete Setup Guide

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| MySQL | 8.0+ | `mysql --version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |

---

## STEP 1 — MySQL Database Banao

```bash
mysql -u root -p

CREATE DATABASE astrologer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## STEP 2 — Backend Setup

```bash
cd astro-platform-backend

# .env mein DB_PASSWORD apna MySQL password set karo
nano .env

# Dependencies install karo
composer install

# App key generate karo
php artisan key:generate

# Storage link (image upload ke liye)
php artisan storage:link

# Tables + test data
php artisan migrate
php artisan db:seed

# Cache clear
php artisan config:clear

# Server start karo
php artisan serve
# → http://localhost:8000
```

---

## STEP 3 — Frontend Setup (Naye Terminal Mein)

```bash
cd astro-platform-frontend

# .env check karo — VITE_API_URL=http://localhost:8000/api/v1 hona chahiye
cat .env

# Dependencies install karo
npm install

# Dev server start karo
npm run dev
# → http://localhost:5173
```

---

## Login Credentials

| Role | Email | Password | URL |
|------|-------|----------|-----|
| Super Admin | superadmin@test.com | password | /admin/login |
| Admin | admin@test.com | password | /admin/login |
| Astrologer | astrologer@test.com | password | /login |
| User | user@test.com | password | / |

---

## Refresh Token Enable Karna (Optional)

```php
// astro-platform-backend/config/features.php
'refresh_token' => true,  // false → true karo
```

```bash
php artisan config:clear
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| Access denied for user 'root' | .env mein DB_PASSWORD fix karo |
| Class not found errors | `composer dump-autoload && php artisan config:clear` |
| CORS error browser mein | config/cors.php mein http://localhost:5173 check karo |
| Blank frontend page | .env mein VITE_API_URL check karo |
| Migration fail | `php artisan migrate:fresh --seed` |

---

## Daily Commands

```bash
# Backend
cd astro-platform-backend && php artisan serve

# Frontend (naya terminal)
cd astro-platform-frontend && npm run dev

# Logs dekhna
tail -f astro-platform-backend/storage/logs/laravel.log

# Fresh database
cd astro-platform-backend && php artisan migrate:fresh --seed
```

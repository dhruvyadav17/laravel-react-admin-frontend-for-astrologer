# AstroPortal — Setup Guide

## Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

---

## Backend Setup

```bash
cd astro-platform-backend

# 1. Install dependencies
composer install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env — set your DB credentials
#    DB_DATABASE=astrologer
#    DB_USERNAME=root
#    DB_PASSWORD=your_password

# 4. Generate app key
php artisan key:generate

# 5. Create database (in MySQL)
# CREATE DATABASE astrologer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 6. Run migrations + seeders
php artisan migrate
php artisan db:seed

# 7. Create storage link
php artisan storage:link

# 8. Start server
php artisan serve
# → http://localhost:8000
```

---

## Frontend Setup

```bash
cd astro-platform-frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Test Credentials

| Role       | Email                   | Password   |
|------------|-------------------------|------------|
| Super Admin| superadmin@test.com     | password   |
| Admin      | admin@test.com          | password   |
| Astrologer | astrologer@test.com     | password   |
| User       | user@test.com           | password   |

---

## Portals

| Portal     | URL                              |
|------------|----------------------------------|
| User       | http://localhost:5173            |
| Astrologer | http://localhost:5173/astrologer |
| Admin      | http://localhost:5173/admin      |

---

## Localhost WebRTC Testing (Video Call)

For testing video calls on the same machine:

1. Open `chrome://flags/#allow-insecure-localhost` → **Enable** → Relaunch
2. Open `chrome://flags/#webrtc-hide-local-ips-with-mdns` → **Disabled** → Relaunch
3. Use **Chrome (normal)** as Astrologer, **Chrome Incognito** as User
4. Clear old signals before each test:
   ```bash
   php artisan tinker
   >>> \App\Models\ChatMessage::whereNotNull('signal_type')->delete();
   ```

---

## Architecture

```
astro-platform/
├── astro-platform-backend/      # Laravel 12 API
│   ├── app/
│   │   ├── Features/            # Domain features (Auth, Astrologer, User)
│   │   ├── Http/Controllers/Api/  # API controllers
│   │   ├── Models/              # Eloquent models
│   │   ├── Notifications/       # Push + email notifications
│   │   ├── Services/App/        # Business logic services
│   │   └── Enums/               # PHP 8.1 enums
│   ├── database/
│   │   ├── migrations/          # DB schema
│   │   └── seeders/             # Test data
│   └── routes/api/v1.php        # All API routes
│
└── astro-platform-frontend/     # React 19 + TypeScript
    └── src/
        ├── admin/               # Admin portal (AdminLTE)
        ├── astrologer/          # Astrologer portal
        ├── user/                # User portal
        ├── features/            # Feature components
        ├── store/               # Redux + RTK Query
        ├── hooks/               # Custom hooks
        └── components/          # Shared UI components
```

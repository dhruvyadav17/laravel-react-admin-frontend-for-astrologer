# Astro Platform — Docker Setup

## File Structure

```
docker-setup/
├── docker-compose.yml          # LOCAL: MySQL container + Vite dev
├── docker-compose.aws.yml      # AWS: RDS + production build
│
├── docker/
│   ├── php/
│   │   ├── Dockerfile          # Multi-stage: local | production
│   │   ├── php-local.ini       # Dev PHP settings
│   │   ├── php-prod.ini        # Production PHP settings
│   │   ├── opcache.ini         # OPcache (production only)
│   │   ├── xdebug.ini          # Xdebug (local only)
│   │   └── entrypoint.sh       # Runs artisan cache:* at start (prod)
│   ├── node/
│   │   └── Dockerfile          # Multi-stage: dev | build
│   ├── nginx/
│   │   └── spa.conf            # SPA fallback for static serving
│   └── mysql/
│       └── init.sql            # Creates DB on first MySQL start
│
├── nginx/conf.d/
│   ├── local.conf              # Nginx: Vite proxy + PHP-FPM FastCGI
│   └── aws.conf                # Nginx: HTTPS + SPA + PHP-FPM FastCGI
│
├── backend/
│   ├── .env.local              # Local env template
│   └── .env.aws                # AWS env template — fill RDS creds
│
├── frontend/
│   ├── .env.local
│   ├── .env.aws
│   └── vite.config.docker.ts   # Vite config with HMR for Docker
│
└── scripts/
    ├── copy-docker-files.sh    # Copies docker/ into build contexts
    ├── local-setup.sh          # One-time local setup
    ├── ec2-setup.sh            # One-time EC2 server provisioning
    ├── aws-deploy.sh           # First AWS deploy
    └── aws-update.sh           # Rolling update (no downtime)
```

---

## How It Works

### Local (localhost MySQL)

```
Browser → localhost:80
          └── Nginx
               ├── /api/*    → FastCGI → PHP-FPM (backend:9000)
               └── /*        → Vite dev server (frontend:5173) + HMR
```

### AWS (RDS)

```
Browser → EC2:443
          └── Nginx
               ├── /api/*    → FastCGI → PHP-FPM (backend:9000)
               └── /*        → /usr/share/nginx/html (built React SPA)
                               (no separate frontend container on AWS)
```

### Key difference: Local vs AWS DB

```
LOCAL:  DB_HOST=mysql                         (docker container)
AWS:    DB_HOST=xxx.ap-south-1.rds.amazonaws.com  (managed RDS)
```

---

## Local Setup (first time)

```bash
# 1. Copy this docker-setup/ folder into project root
# 2. Run:
bash scripts/local-setup.sh
```

That script:
- Copies ini/Dockerfile files into backend/docker/php/
- Copies .env files
- Builds images
- Starts MySQL, Redis, PHP-FPM, Vite, Nginx, Queue worker
- Runs migrations + seeders

**Access:**
- App: http://localhost
- API: http://localhost/api/v1
- MySQL GUI: localhost:3306 (user: astro_user / secret)

**Daily use:**
```bash
docker compose up -d       # start
docker compose down        # stop
docker compose logs -f     # logs

docker compose exec backend php artisan migrate
docker compose exec backend php artisan tinker
docker compose exec mysql mysql -u astro_user -psecret astrologer
```

---

## AWS Setup

### Step 1 — EC2

1. Launch **Ubuntu 22.04** EC2 (t3.small or larger)
2. Open ports in Security Group:

```
Inbound:
  80   (HTTP)   → 0.0.0.0/0
  443  (HTTPS)  → 0.0.0.0/0
  22   (SSH)    → your IP only
```

3. SSH in and run:
```bash
bash scripts/ec2-setup.sh
# log out and back in
```

### Step 2 — RDS

1. AWS Console → RDS → Create database
2. **Engine:** MySQL 8.0
3. **Template:** Production (Multi-AZ) or Free tier (dev)
4. **Credentials:** set username and password
5. **VPC:** same VPC as EC2
6. **Public access:** No
7. **Security Group:**

```
RDS Inbound:
  3306 (MySQL) → EC2 Security Group ID  ← only EC2 can reach RDS
```

8. Copy the **Endpoint** (looks like `xxx.ap-south-1.rds.amazonaws.com`)

### Step 3 — Configure .env.aws

```bash
nano backend/.env.aws
```

Fill in:
```env
APP_KEY=           # will be generated in next step
APP_URL=https://your-domain.com

DB_HOST=your-rds-endpoint.ap-south-1.rds.amazonaws.com
DB_DATABASE=astrologer
DB_USERNAME=astro_user
DB_PASSWORD=your-rds-password

REDIS_PASSWORD=choose-a-strong-password
```

### Step 4 — Deploy

```bash
git clone https://github.com/your/repo.git
cd repo
bash scripts/aws-deploy.sh
```

### Step 5 — SSL (Let's Encrypt)

```bash
# Get cert (run once)
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d your-domain.com --non-interactive --agree-tos -m your@email.com

# Auto-renew (add to crontab: crontab -e)
0 3 * * 0 docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt -v $(pwd)/certbot/www:/var/www/certbot certbot/certbot renew --quiet && docker compose -f docker-compose.aws.yml exec nginx nginx -s reload
```

### Updates after new code

```bash
git pull origin main
bash scripts/aws-update.sh
```

---

## Troubleshooting

**MySQL connection refused:**
```bash
docker compose exec backend php artisan db:show   # check connection
docker compose logs mysql                         # see MySQL errors
```

**PHP-FPM errors:**
```bash
docker compose logs backend
docker compose exec backend php artisan config:clear
```

**Vite HMR not working:**
Copy `frontend/vite.config.docker.ts` to `frontend/vite.config.ts` when running in Docker.

**RDS connection timeout:**
- Check RDS Security Group allows EC2's Security Group ID on port 3306
- Check both are in the same VPC

**Queue not processing:**
```bash
docker compose logs queue
docker compose restart queue
docker compose exec backend php artisan queue:monitor
```

---

## Containers

| Container | Image | Purpose |
|-----------|-------|---------|
| astro_mysql | mysql:8.0 | Local DB (not on AWS) |
| astro_redis | redis:7-alpine | Cache + sessions + queue |
| astro_backend | php:8.2-fpm | Laravel API + PHP-FPM |
| astro_frontend | node:20 | Vite dev server (local only) |
| astro_nginx | nginx:1.25 | Reverse proxy + SPA serve |
| astro_queue | php:8.2-fpm | Queue worker |
| astro_scheduler | php:8.2-fpm | Artisan schedule (AWS only) |

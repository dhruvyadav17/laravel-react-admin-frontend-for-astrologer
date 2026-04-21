# ─────────────────────────────────────────────────────────────────
#  Multi-stage PHP-FPM Dockerfile
#
#  Build context: ./backend  (set in docker-compose)
#  ini files expected at: backend/docker/php/*.ini
#
#  Stages:
#    local      — dev with xdebug, vendor mounted from volume
#    production — optimized, no dev deps, opcache maxed
# ─────────────────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS base

# System dependencies
RUN apk add --no-cache \
    bash curl git unzip \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    oniguruma-dev libxml2-dev libzip-dev \
    mysql-client icu-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) \
        pdo pdo_mysql \
        mbstring bcmath \
        gd zip xml \
        opcache intl pcntl

# Redis PHP extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer 2
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# PHP-FPM ping endpoint for health checks
RUN echo "[www]" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.status_path = /status" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "ping.path = /ping" >> /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www

# ── LOCAL stage ───────────────────────────────────────────────────
FROM base AS local

RUN pecl install xdebug && docker-php-ext-enable xdebug

# ini files come from backend/docker/php/ (inside build context)
COPY docker/php/xdebug.ini    /usr/local/etc/php/conf.d/xdebug.ini
COPY docker/php/php-local.ini /usr/local/etc/php/conf.d/99-app.ini

# Install deps — vendor dir is overridden by volume mount in docker-compose
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-interaction

COPY . .
RUN composer dump-autoload --no-scripts

EXPOSE 9000
CMD ["php-fpm"]

# ── PRODUCTION stage ──────────────────────────────────────────────
FROM base AS production

COPY docker/php/php-prod.ini  /usr/local/etc/php/conf.d/99-app.ini
COPY docker/php/opcache.ini   /usr/local/etc/php/conf.d/10-opcache.ini

# Install deps first (better layer caching)
COPY composer.json composer.lock ./
RUN composer install \
      --no-dev \
      --no-scripts \
      --no-autoloader \
      --no-interaction

COPY . .

RUN composer dump-autoload \
      --no-dev \
      --classmap-authoritative \
      --no-scripts && \
    php artisan package:discover --ansi

# Set correct permissions
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# entrypoint.sh runs cache commands at container start (DB must be ready)
COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]

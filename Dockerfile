# Root-level Dockerfile for Back4App — builds fleet-mgt-api
# Docker context = repo root, all paths prefixed with fleet-mgt-api/

# ─── Stage: vendor ────────────────────────────────────────────────
FROM composer:2 AS vendor
WORKDIR /app
COPY fleet-mgt-api/composer.json fleet-mgt-api/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts

# ─── Stage: prod (Nginx + PHP-FPM via supervisord) ────────────────
FROM php:8.2-fpm AS prod
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev libpq-dev zip \
    nginx supervisor ca-certificates \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql gd zip opcache \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY fleet-mgt-api/ .

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY fleet-mgt-api/docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY fleet-mgt-api/docker/nginx/api.conf  /etc/nginx/sites-available/default
COPY fleet-mgt-api/docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN rm -f /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY fleet-mgt-api/docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]

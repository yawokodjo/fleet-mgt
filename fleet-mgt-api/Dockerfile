# ─── Stage: vendor ────────────────────────────────────────────────
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts

# ─── Stage: dev (php artisan serve + hot reload) ──────────────────
FROM php:8.2-fpm AS dev
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev \
    zip git unzip curl wget \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd zip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN wget -q https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
    && tar -C /usr/local/bin -xzf dockerize-linux-amd64-v0.6.1.tar.gz \
    && rm dockerize-linux-amd64-v0.6.1.tar.gz
WORKDIR /var/www/html
EXPOSE 8000
CMD ["dockerize", "-wait", "tcp://db:3306", "-timeout", "30s", \
     "php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ─── Stage: prod (Nginx + PHP-FPM via supervisord) ────────────────
FROM php:8.2-fpm AS prod
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev zip \
    nginx supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd zip opcache \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/nginx/api.conf /etc/nginx/sites-enabled/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN rm /etc/nginx/sites-enabled/default 2>/dev/null; \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/ 2>/dev/null || true
COPY docker/nginx/api.conf /etc/nginx/sites-available/default

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]

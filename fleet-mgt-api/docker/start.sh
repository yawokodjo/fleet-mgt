#!/bin/sh
set -e

# Railway injects $PORT — nginx must listen on it
if [ -n "$PORT" ]; then
    sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/sites-available/default
fi

# Ensure all storage directories exist with correct permissions
mkdir -p storage/framework/cache/laravel-excel \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

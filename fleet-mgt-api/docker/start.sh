#!/bin/sh

# Render/Railway inject $PORT — nginx must listen on it
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

php artisan config:clear  || true
php artisan config:cache  || true
php artisan route:cache   || true
php artisan view:cache    || true
php artisan migrate --force || echo "[start.sh] migrate failed — continuing"

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

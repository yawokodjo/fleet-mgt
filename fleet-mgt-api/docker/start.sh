#!/bin/sh
set -e

# Railway injects $PORT — nginx must listen on it
if [ -n "$PORT" ]; then
    sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/sites-available/default
fi

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

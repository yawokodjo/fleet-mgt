#!/bin/sh
# Render/Railway inject $PORT — nginx must listen on it
if [ -n "$PORT" ]; then
    sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/conf.d/default.conf
fi
exec nginx -g "daemon off;"

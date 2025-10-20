FROM php:8.2-fpm

# Installer les extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    git \
    unzip \
    curl \
    wget \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Installer dockerize pour attendre la DB
RUN wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v0.6.1.tar.gz \
    && rm dockerize-linux-amd64-v0.6.1.tar.gz

# Définir le dossier de travail
WORKDIR /var/www/html

# Étape 1 : copier uniquement composer.json et composer.lock
COPY composer.json composer.lock ./

# Étape 2 : installer dépendances sans scripts artisan
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts

# Étape 3 : copier le reste du projet (y compris artisan)
COPY . .

# Étape 4 : exécuter les scripts post-install après que artisan soit présent
RUN composer run-script post-autoload-dump || true

# Exposer le port Laravel
EXPOSE 8000

# Lancer Laravel avec dockerize (attente DB)
CMD ["dockerize", "-wait", "tcp://db:3306", "-timeout", "30s", "php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

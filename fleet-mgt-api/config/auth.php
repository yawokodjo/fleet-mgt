<?php

return array(

    'defaults' => array(

        'guard' => 'web', // pour les sessions web classiques
        'passwords' => 'users',
    ),

    'guards' => array(
        'web' => array(
            'driver' => 'session',
            'provider' => 'users',
        ),

        'api' => array(

            'driver' => 'sanctum', // API guard avec Sanctum
            'provider' => 'users',
        ),
    ),

    'providers' => array(
        'users' => array(
            'driver' => 'eloquent',
            'model' => App\Models\User::class,  // Utilisation du modèle User par défaut
        ),
    ),

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens', // Laravel 12+
            'expire' => 60,
            'throttle' => 60,
        ],
    ],


    'password_timeout' => 10800,

);

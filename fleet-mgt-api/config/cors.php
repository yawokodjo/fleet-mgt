<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_merge(
        ['http://localhost:5173', 'http://localhost:8000'],
        env('FRONTEND_URL') ? [env('FRONTEND_URL')] : []
    )),

    'allowed_origins_patterns' => [
        '#^https://.*\.up\.railway\.app$#',
        '#^https://.*\.pages\.dev$#',
        '#^https://.*\.b4a\.run$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

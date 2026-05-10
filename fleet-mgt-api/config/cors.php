<?php

return array(

    'paths' => array('api/*', 'sanctum/csrf-cookie'),

    'allowed_methods' => array('*'),

    'allowed_origins' => array_filter(array_merge(
        ['http://localhost:5173', 'http://localhost:8000'],
        env('FRONTEND_URL') ? [env('FRONTEND_URL')] : []
    )),

    'allowed_origins_patterns' => ['#^https://.*\.up\.railway\.app$#'],

    'allowed_headers' => array('*'),

    'exposed_headers' => array(),

    'max_age' => 0,

    'supports_credentials' => true,

);

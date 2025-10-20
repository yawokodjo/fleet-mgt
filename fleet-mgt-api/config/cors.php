<?php

return array(

    'paths' => array('api/*', 'sanctum/csrf-cookie'),

    'allowed_methods' => array('*'),

    'allowed_origins' => array('http://localhost:5173', 'http://localhost:8000'),

    'allowed_origins_patterns' => array(),

    'allowed_headers' => array('*'),

    'exposed_headers' => array(),

    'max_age' => 0,

    'supports_credentials' => true,

);

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 *
 */
class CorsMiddleware
{
    /**
     *
     *
     * @param Request $request
     * @param Closure $next
     * @return
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return $response;
    }
}
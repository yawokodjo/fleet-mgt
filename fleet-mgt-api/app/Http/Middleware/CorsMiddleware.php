<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // CORS is handled by config/cors.php via HandleCors middleware.
        // This class is kept for compatibility but does nothing.
        return $next($request);
    }
}

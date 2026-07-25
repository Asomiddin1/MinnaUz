<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SwaggerAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Login bo'lmaganlarni chiqarish
        if (!auth()->check()) {
            abort(401, 'Unauthorized');
        }

        // Faqat adminlarga ruxsat
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Forbidden');
        }

        return $next($request);
    }
}
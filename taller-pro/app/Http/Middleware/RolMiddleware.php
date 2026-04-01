<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolMiddleware
{
	/**
	 * Handle an incoming request.
	 *
	 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
	 */
	public function handle(Request $request, Closure $next, string ...$roles): Response
	{
		$user = $request->user();

		if (!$user || !$user->activo) {
			return response()->json(['message' => 'No autenticado'], 401);
		}

		if (empty($roles)) {
			return $next($request);
		}

		$userRole = optional($user->rol)->nombre;
		if (!$userRole || !in_array($userRole, $roles, true)) {
			return response()->json(['message' => 'No autorizado'], 403);
		}

		return $next($request);
	}
}


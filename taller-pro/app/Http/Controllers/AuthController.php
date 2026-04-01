<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
	public function login(Request $request)
	{
		$credentials = $request->validate([
			'email' => ['required', 'email'],
			'password' => ['required', 'string'],
		]);

		/** @var User|null $user */
		$user = User::with('rol')->where('email', $credentials['email'])->first();

		if (!$user || !Hash::check($credentials['password'], $user->password)) {
			throw ValidationException::withMessages([
				'email' => ['Credenciales inválidas.'],
			]);
		}

		if (!$user->activo) {
			return response()->json(['message' => 'Usuario inactivo'], 403);
		}

		$deviceName = $request->input('device_name', 'web');

		// Create Sanctum token (expiration is managed via sanctum config if set).
		$token = $user->createToken($deviceName)->plainTextToken;

		return response()->json([
			'token' => $token,
			'user' => [
				'id' => $user->id,
				'nombre' => $user->name,
				'email' => $user->email,
				'rol' => optional($user->rol)->nombre,
			],
		]);
	}

	public function me(Request $request)
	{
		$user = $request->user()->load('rol');
		return response()->json([
			'id' => $user->id,
			'nombre' => $user->name,
			'email' => $user->email,
			'rol' => optional($user->rol)->nombre,
		]);
	}

	public function logout(Request $request)
	{
		$request->user()->currentAccessToken()?->delete();
		return response()->json(['message' => 'Sesión cerrada']);
	}
}


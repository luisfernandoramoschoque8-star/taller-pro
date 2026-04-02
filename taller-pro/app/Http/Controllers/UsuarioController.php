<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
	public function index()
	{
		$users = User::with('rol')->orderBy('id')->get(['id','name as nombre','email','rol_id','activo']);
		$roles = Rol::orderBy('nombre')->get(['id','nombre']);
		return response()->json(['users' => $users, 'roles' => $roles]);
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'nombre' => ['required', 'string', 'max:255'],
			'email' => ['required', 'email', Rule::unique('users', 'email')],
			'password' => ['required', 'string', 'min:6'],
			'rol_id' => ['required', 'exists:roles,id'],
			'activo' => ['nullable', 'boolean'],
		]);
		$user = User::create([
			'name' => $data['nombre'],
			'email' => $data['email'],
			'password' => $data['password'], // se hashea por cast en el modelo
			'rol_id' => $data['rol_id'],
			'activo' => (bool) ($data['activo'] ?? true),
		]);
		return response()->json($user->load('rol'), 201);
	}

	public function updateRol(Request $request, User $user)
	{
		$data = $request->validate([
			'rol_id' => ['required', 'exists:roles,id'],
			'activo' => ['nullable', 'boolean'],
		]);
		$user->rol_id = $data['rol_id'];
		if ($request->has('activo')) {
			$user->activo = (bool) $data['activo'];
		}
		$user->save();
		return response()->json($user->load('rol'));
	}

	public function resetPassword(Request $request, User $user)
	{
		$data = $request->validate([
			'password' => ['required', 'string', 'min:6'],
		]);
		$user->password = $data['password']; // cast hash
		$user->save();
		return response()->json(['message' => 'Contraseña actualizada']);
	}

	public function destroy(User $user)
	{
		$user->delete();
		return response()->json(['message' => 'Usuario eliminado']);
	}
}


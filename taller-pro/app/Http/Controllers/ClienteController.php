<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
	public function index(Request $request)
	{
		$term = $request->query('q');
		$clientes = Cliente::search($term)->orderBy('nombre')->paginate(10);
		return response()->json($clientes);
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'nombre' => ['required', 'string', 'max:255'],
			'telefono' => ['nullable', 'string', 'max:50'],
			'email' => ['nullable', 'email', 'max:255', Rule::unique('clientes', 'email')->ignore(null)],
			'direccion' => ['nullable', 'string', 'max:255'],
			'ci' => ['nullable', 'string', 'max:100'],
			'activo' => ['boolean'],
		]);

		$cliente = Cliente::create($data + ['activo' => $request->boolean('activo', true)]);
		return response()->json($cliente, 201);
	}

	public function show(Cliente $cliente)
	{
		return response()->json($cliente);
	}

	public function all()
	{
		return response()->json(
			Cliente::orderBy('nombre')->get(['id', 'nombre', 'ci'])
		);
	}

	public function update(Request $request, Cliente $cliente)
	{
		$data = $request->validate([
			'nombre' => ['required', 'string', 'max:255'],
			'telefono' => ['nullable', 'string', 'max:50'],
			'email' => ['nullable', 'email', 'max:255', Rule::unique('clientes', 'email')->ignore($cliente->id)],
			'direccion' => ['nullable', 'string', 'max:255'],
			'ci' => ['nullable', 'string', 'max:100'],
			'activo' => ['boolean'],
		]);
		$cliente->update($data);
		return response()->json($cliente);
	}

	public function destroy(Cliente $cliente)
	{
		$cliente->delete();
		return response()->json(['message' => 'Cliente eliminado']);
	}

	public function toggle(Cliente $cliente)
	{
		$cliente->activo = !$cliente->activo;
		$cliente->save();
		return response()->json($cliente);
	}
}


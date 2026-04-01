<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
	public function index(Request $request)
	{
		$q = $request->query('q');
		$servicios = Servicio::when($q, fn($s) => $s->where('nombre', 'like', '%'.$q.'%'))
			->orderBy('nombre')->paginate(10);
		return response()->json($servicios);
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'nombre' => ['required', 'string', 'max:255'],
			'descripcion' => ['nullable', 'string'],
			'precio' => ['required', 'numeric', 'min:0'],
			'duracion_minutos' => ['required', 'integer', 'min:0'],
			'activo' => ['boolean'],
		]);
		$servicio = Servicio::create($data + ['activo' => $request->boolean('activo', true)]);
		return response()->json($servicio, 201);
	}

	public function show(Servicio $servicio)
	{
		return response()->json($servicio);
	}

	public function all()
	{
		return response()->json(
			Servicio::orderBy('nombre')->get(['id', 'nombre', 'precio', 'activo'])
		);
	}

	public function update(Request $request, Servicio $servicio)
	{
		$data = $request->validate([
			'nombre' => ['required', 'string', 'max:255'],
			'descripcion' => ['nullable', 'string'],
			'precio' => ['required', 'numeric', 'min:0'],
			'duracion_minutos' => ['required', 'integer', 'min:0'],
			'activo' => ['boolean'],
		]);
		$servicio->update($data);
		return response()->json($servicio);
	}

	public function toggle(Servicio $servicio)
	{
		$servicio->activo = !$servicio->activo;
		$servicio->save();
		return response()->json($servicio);
	}

	public function destroy(Servicio $servicio)
	{
		$servicio->delete();
		return response()->json(['message' => 'Servicio eliminado']);
	}
}


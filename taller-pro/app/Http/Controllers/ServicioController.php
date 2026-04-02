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
		$rows = Servicio::where('activo', true)
			->orderBy('nombre')
			->get(['id', 'nombre', 'precio', 'activo']);

		// Debug logging to local NDJSON file for investigation
		try {
			$payload = [
				'id' => 'log_'.time().'_servicios_all',
				'timestamp' => round(microtime(true) * 1000),
				'location' => 'ServicioController@all',
				'message' => 'Servicios activos devueltos',
				'data' => [
					'count' => $rows->count(),
					'first' => $rows->take(8)->map(fn($r) => ['id' => $r->id, 'nombre' => $r->nombre, 'precio' => $r->precio]),
				],
				'runId' => 'pre-fix',
				'hypothesisId' => 'H1_backend',
			];
			$logPath = base_path('.cursor/debug.log');
			$dir = dirname($logPath);
			if (!is_dir($dir)) {
				@mkdir($dir, 0777, true);
			}
			@file_put_contents($logPath, json_encode($payload, JSON_UNESCAPED_UNICODE).PHP_EOL, FILE_APPEND);
		} catch (\Throwable $e) {
			// silencioso
		}

		return response()->json($rows->values());
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


<?php

namespace App\Http\Controllers;

use App\Models\OrdenServicio;
use App\Models\Servicio;
use Illuminate\Http\Request;

class OrdenServicioController extends Controller
{
	protected function nextCode(): string
	{
		$last = OrdenServicio::orderByDesc('id')->value('codigo');
		$seq = 0;
		if ($last && preg_match('/SRV\-(\d+)/', $last, $m)) {
			$seq = (int)$m[1];
		}
		return 'SRV-'.str_pad((string)($seq + 1), 3, '0', STR_PAD_LEFT);
	}

	public function resumen()
	{
		return response()->json([
			'pendientes' => OrdenServicio::where('estado', 'pendiente')->count(),
			'en_proceso' => OrdenServicio::where('estado', 'en_proceso')->count(),
			'completados_hoy' => OrdenServicio::where('estado', 'completado')
				->whereDate('updated_at', now()->toDateString())->count(),
		]);
	}

	public function index(Request $request)
	{
		$q = $request->query('q');
		$ordenes = OrdenServicio::with(['cliente', 'servicio'])
			->when($q, function ($query) use ($q) {
				$query->where('codigo', 'like', '%'.$q.'%')
					->orWhereHas('cliente', fn($c) => $c->where('nombre', 'like', '%'.$q.'%'))
					->orWhere('vehiculo', 'like', '%'.$q.'%');
			})
			->orderByDesc('created_at')
			->paginate(10);

		return response()->json($ordenes);
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'cliente_id' => ['nullable', 'exists:clientes,id'],
			'vehiculo' => ['nullable', 'string', 'max:255'],
			'servicio_id' => ['nullable', 'exists:servicios,id'],
			'mecanico' => ['nullable', 'string', 'max:255'],
			'fecha' => ['nullable', 'date'],
			'estado' => ['nullable', 'in:pendiente,en_proceso,completado'],
			'total' => ['nullable', 'numeric', 'min:0'],
		]);

		$codigo = $this->nextCode();
		$total = $data['total'] ?? null;
		if ($total === null && !empty($data['servicio_id'])) {
			$total = (float) (Servicio::where('id', $data['servicio_id'])->value('precio') ?? 0);
		}

		$order = OrdenServicio::create([
			'codigo' => $codigo,
			'cliente_id' => $data['cliente_id'] ?? null,
			'vehiculo' => $data['vehiculo'] ?? null,
			'servicio_id' => $data['servicio_id'] ?? null,
			'mecanico' => $data['mecanico'] ?? null,
			'fecha' => $data['fecha'] ?? now(),
			'estado' => $data['estado'] ?? 'pendiente',
			'total' => $total ?? 0,
		]);

		return response()->json($order->load(['cliente', 'servicio']), 201);
	}
}


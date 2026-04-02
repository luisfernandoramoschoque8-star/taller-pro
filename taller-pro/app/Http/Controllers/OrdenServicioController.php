<?php

namespace App\Http\Controllers;

use App\Models\OrdenServicio;
use App\Models\Servicio;
use App\Models\Caja;
use App\Models\MovimientoCaja;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class OrdenServicioController extends Controller
{
	protected function nextCode(): string
	{
		$max = 0;
		$codes = OrdenServicio::pluck('codigo');
		foreach ($codes as $c) {
			if (preg_match('/^SRV\-(\d+)$/', (string) $c, $m)) {
				$max = max($max, (int) $m[1]);
			}
		}
		$next = $max + 1;
		do {
			$code = 'SRV-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT);
			$exists = OrdenServicio::where('codigo', $code)->exists();
			$next++;
		} while ($exists);
		return $code;
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
		$estado = $request->query('estado');
		$ordenes = OrdenServicio::with(['cliente', 'servicio'])
			->when($q, function ($query) use ($q) {
				$query->where('codigo', 'like', '%'.$q.'%')
					->orWhereHas('cliente', fn($c) => $c->where('nombre', 'like', '%'.$q.'%'))
					->orWhere('vehiculo', 'like', '%'.$q.'%');
			})
			->when(in_array($estado, ['pendiente', 'en_proceso', 'completado'], true), function ($query) use ($estado) {
				$query->where('estado', $estado);
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

		try {
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
		} catch (QueryException $e) {
			// Si hubo colisión de código por concurrencia, reintentar una vez.
			if ((int)($e->errorInfo[1] ?? 0) === 1062) {
				$order = OrdenServicio::create([
					'codigo' => $this->nextCode(),
					'cliente_id' => $data['cliente_id'] ?? null,
					'vehiculo' => $data['vehiculo'] ?? null,
					'servicio_id' => $data['servicio_id'] ?? null,
					'mecanico' => $data['mecanico'] ?? null,
					'fecha' => $data['fecha'] ?? now(),
					'estado' => $data['estado'] ?? 'pendiente',
					'total' => $total ?? 0,
				]);
			} else {
				throw $e;
			}
		}

		// Registrar ingreso en caja si hay caja abierta
		try {
			$caja = Caja::where('estado', 'abierta')->latest('id')->first();
			if ($caja && (float) $order->total > 0) {
				MovimientoCaja::create([
					'caja_id' => $caja->id,
					'venta_id' => null,
					'tipo' => 'ingreso',
					'monto' => (float) $order->total,
					'descripcion' => 'Servicio '.$order->codigo,
				]);
			}
		} catch (\Throwable $e) {
			// silencioso: no bloquear creación de la orden por caja
		}

		return response()->json($order->load(['cliente', 'servicio']), 201);
	}

	public function updateEstado(Request $request, OrdenServicio $ordenServicio)
	{
		$data = $request->validate([
			'estado' => ['required', 'in:pendiente,en_proceso,completado'],
		]);

		$ordenServicio->estado = $data['estado'];
		$ordenServicio->save();

		return response()->json([
			'message' => 'Estado actualizado',
			'orden' => $ordenServicio,
		]);
	}
}


<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\OrdenServicio;
use App\Models\Producto;
use App\Models\Servicio;
use App\Models\Venta;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
	public function index()
	{
		$totalClientes = Cliente::count();
		$serviciosHoy = OrdenServicio::whereDate('fecha', now()->toDateString())->count();
		$ventasMes = (float) Venta::where('estado', '!=', 'anulado')
			->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
			->sum('total');
		if ($ventasMes <= 0) {
			$ventasMes = (float) OrdenServicio::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
				->sum('total');
		}
		$stockBajo = Producto::whereColumn('stock', '<=', 'stock_minimo')->count();

		$serviciosRecientes = OrdenServicio::with(['cliente', 'servicio'])
			->orderByDesc('fecha')
			->limit(5)
			->get()
			->map(fn($s) => [
				'id' => $s->codigo,
				'cliente' => optional($s->cliente)->nombre ?? '-',
				'servicio' => optional($s->servicio)->nombre ?? '-',
				'estado' => $s->estado,
			]);

		$ultimasVentas = Venta::with('cliente')
			->where('estado', '!=', 'anulado')
			->orderByDesc('created_at')
			->limit(4)
			->get()
			->map(fn($v) => [
				'id' => 'VEN-'.str_pad((string)$v->id, 3, '0', STR_PAD_LEFT),
				'cliente' => optional($v->cliente)->nombre ?? '-',
				'total' => (float)$v->total,
				'fecha' => $v->created_at->format('Y-m-d H:i'),
			]);
		if ($ultimasVentas->isEmpty()) {
			$ultimasVentas = OrdenServicio::with('cliente')
				->orderByDesc('created_at')
				->limit(4)
				->get()
				->map(fn($o) => [
					'id' => 'VEN-'.str_pad((string)$o->id, 3, '0', STR_PAD_LEFT),
					'cliente' => optional($o->cliente)->nombre ?? '-',
					'total' => (float)$o->total,
					'fecha' => optional($o->created_at)?->format('Y-m-d H:i'),
				]);
		}

		// Mostrar servicios únicos por nombre normalizado (evita duplicados por mayúsculas/espacios).
		// 1) Cantidades vendidas (detalle_ventas) y 2) Cantidades registradas en órdenes de servicio.
		$cantidadesPorServicioId = DetalleVenta::selectRaw('servicio_id, SUM(cantidad) as cantidad')
			->where('tipo', 'servicio')
			->groupBy('servicio_id')
			->pluck('cantidad', 'servicio_id');

		$cantOrdenesPorServicioId = OrdenServicio::selectRaw('servicio_id, COUNT(*) as cantidad')
			->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
			->groupBy('servicio_id')
			->pluck('cantidad', 'servicio_id');

		$unicos = [];
		$serviciosActivos = Servicio::where('activo', true)->get(['id', 'nombre']);
		foreach ($serviciosActivos as $srv) {
			$key = mb_strtolower(trim((string) $srv->nombre));
			if ($key === '') continue;
			if (!isset($unicos[$key])) {
				$unicos[$key] = [
					'nombre' => trim((string) $srv->nombre),
					'cantidad' => 0,
				];
			}
			$vendidas = (int) ($cantidadesPorServicioId[$srv->id] ?? 0);
			$ordenadas = (int) ($cantOrdenesPorServicioId[$srv->id] ?? 0);
			// Sumamos ambas fuentes para reflejar demanda total reciente.
			$unicos[$key]['cantidad'] += ($vendidas + $ordenadas);
		}

		$topServicios = collect(array_values($unicos))
			->sortByDesc('cantidad')
			->take(5)
			->values();


		return response()->json([
			'kpis' => [
				'total_clientes' => $totalClientes,
				'servicios_hoy' => $serviciosHoy,
				'ventas_mes' => $ventasMes,
				'stock_bajo' => $stockBajo,
			],
			'servicios_recientes' => $serviciosRecientes,
			'ultimas_ventas' => $ultimasVentas,
			'top_servicios' => $topServicios,
		]);
	}
}


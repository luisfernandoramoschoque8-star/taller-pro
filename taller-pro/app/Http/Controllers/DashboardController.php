<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\OrdenServicio;
use App\Models\Producto;
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

		$topServicios = DetalleVenta::join('servicios', 'detalle_ventas.servicio_id', '=', 'servicios.id')
			->where('detalle_ventas.tipo', 'servicio')
			->selectRaw('servicios.nombre as nombre, SUM(detalle_ventas.cantidad) as cantidad')
			->groupBy('servicios.nombre')
			->orderByDesc('cantidad')
			->limit(5)
			->get();

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


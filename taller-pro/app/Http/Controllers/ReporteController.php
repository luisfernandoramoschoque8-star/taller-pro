<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\OrdenServicio;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
	public function resumen(Request $request)
	{
		$periodo = $request->query('periodo', 'mes'); // hoy|semana|mes
		[$from, $to] = $this->rango($periodo);

		$ventasQ = Venta::whereBetween('created_at', [$from, $to])->where('estado', '!=', 'anulado');
		$totalVentas = (float) $ventasQ->sum('total');
		// Servicios: contar por detalle_ventas; si no hay, contar órdenes en el periodo
		$totalServicios = (int) DetalleVenta::whereBetween('created_at', [$from, $to])
			->where('tipo', 'servicio')->sum('cantidad');
		if ($totalServicios <= 0) {
			$totalServicios = (int) OrdenServicio::whereBetween('created_at', [$from, $to])->count();
		}
		$ingresosNetos = (float) $ventasQ->sum('total');
		$stockBajo = (int) Producto::whereColumn('stock', '<=', 'stock_minimo')->count();

		$ventasPorDia = Venta::selectRaw('DATE(created_at) as fecha, SUM(total) as total')
			->whereBetween('created_at', [$from, $to])
			->where('estado', '!=', 'anulado')
			->groupBy(DB::raw('DATE(created_at)'))
			->orderBy('fecha')
			->get();
		if ($ventasPorDia->isEmpty()) {
			$ventasPorDia = OrdenServicio::selectRaw('DATE(created_at) as fecha, SUM(total) as total')
				->whereBetween('created_at', [$from, $to])
				->groupBy(DB::raw('DATE(created_at)'))
				->orderBy('fecha')
				->get();
		}

		$serviciosSolicitados = DetalleVenta::join('servicios', 'detalle_ventas.servicio_id', '=', 'servicios.id')
			->whereBetween('detalle_ventas.created_at', [$from, $to])
			->where('detalle_ventas.tipo', 'servicio')
			->selectRaw('servicios.nombre, SUM(detalle_ventas.cantidad) as cantidad')
			->groupBy('servicios.nombre')
			->orderByDesc('cantidad')
			->limit(5)
			->get();
		if ($serviciosSolicitados->isEmpty()) {
			$serviciosSolicitados = OrdenServicio::join('servicios', 'ordenes_servicio.servicio_id', '=', 'servicios.id')
				->whereBetween('ordenes_servicio.created_at', [$from, $to])
				->selectRaw('servicios.nombre, COUNT(*) as cantidad')
				->groupBy('servicios.nombre')
				->orderByDesc('cantidad')
				->limit(5)
				->get();
		}

		$stockRows = Producto::with('categoria')
			->whereColumn('stock', '<=', 'stock_minimo')
			->orderBy('stock')
			->limit(8)
			->get()
			->map(fn($p) => [
				'producto' => $p->nombre,
				'categoria' => optional($p->categoria)->nombre ?? '-',
				'stock' => (int)$p->stock,
				'stock_minimo' => (int)$p->stock_minimo,
				'estado' => ((int)$p->stock <= max(1, (int) floor($p->stock_minimo * 0.5))) ? 'crítico' : 'bajo',
			]);

		$ingServicios = (float) DetalleVenta::whereBetween('created_at', [$from, $to])->where('tipo', 'servicio')->sum('subtotal');
		if ($ingServicios <= 0) {
			$ingServicios = (float) OrdenServicio::whereBetween('created_at', [$from, $to])->sum('total');
		}
		$ingProductos = (float) DetalleVenta::whereBetween('created_at', [$from, $to])->where('tipo', 'producto')->sum('subtotal');
		$totalIng = max(1, $ingServicios + $ingProductos);

		return response()->json([
			'kpis' => [
				'total_ventas' => $totalVentas,
				'servicios' => $totalServicios,
				'ingresos_netos' => $ingresosNetos,
				'stock_bajo' => $stockBajo,
			],
			'ventas_por_dia' => $ventasPorDia,
			'servicios_solicitados' => $serviciosSolicitados,
			'stock_bajo_rows' => $stockRows,
			'ingresos_resumen' => [
				'servicios' => ['monto' => $ingServicios, 'porcentaje' => round(($ingServicios / $totalIng) * 100, 1)],
				'productos' => ['monto' => $ingProductos, 'porcentaje' => round(($ingProductos / $totalIng) * 100, 1)],
			],
		]);
	}

	private function rango(string $periodo): array
	{
		$now = now();
		if ($periodo === 'hoy') return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
		if ($periodo === 'semana') return [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()];
		return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
	}
}


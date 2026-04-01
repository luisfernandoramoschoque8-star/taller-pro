<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Models\MovimientoCaja;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CajaController extends Controller
{
	public function estado()
	{
		$caja = Caja::where('estado', 'abierta')->latest('id')->first();
		if (!$caja) {
			return response()->json(['abierta' => false]);
		}

		$movs = MovimientoCaja::where('caja_id', $caja->id)->orderByDesc('created_at')->get();
		$ingresos = (float) $movs->where('tipo', 'ingreso')->sum('monto');
		$egresos = (float) $movs->where('tipo', 'egreso')->sum('monto');
		$totalCaja = (float) $caja->monto_inicial + $ingresos - $egresos;

		return response()->json([
			'abierta' => true,
			'caja' => [
				'id' => $caja->id,
				'monto_inicial' => (float) $caja->monto_inicial,
				'ingresos' => $ingresos,
				'egresos' => $egresos,
				'total_caja' => $totalCaja,
			],
			'movimientos' => $movs->map(fn($m) => [
				'hora' => $m->created_at->format('H:i'),
				'tipo' => $m->tipo,
				'concepto' => $m->descripcion ?? ($m->venta_id ? 'Venta #'.$m->venta_id : '-'),
				'monto' => (float) $m->monto,
			]),
		]);
	}

	public function abrir(Request $request)
	{
		$data = $request->validate(['monto_inicial' => ['required', 'numeric', 'min:0']]);
		if (Caja::where('estado', 'abierta')->exists()) {
			return response()->json(['message' => 'Ya existe una caja abierta'], 422);
		}

		$caja = Caja::create([
			'usuario_id' => $request->user()->id,
			'fecha_apertura' => now(),
			'monto_inicial' => $data['monto_inicial'],
			'monto_final' => 0,
			'total_ventas' => 0,
			'estado' => 'abierta',
		]);
		return response()->json($caja, 201);
	}

	public function cerrar(Request $request)
	{
		$caja = Caja::where('estado', 'abierta')->latest('id')->first();
		if (!$caja) return response()->json(['message' => 'No hay caja abierta'], 422);

		// Validar solo ventas pendientes dentro del periodo de la caja actual.
		$hayPendientes = Venta::where('estado', 'pendiente')
			->where('created_at', '>=', $caja->fecha_apertura ?? now()->startOfDay())
			->exists();

		if ($hayPendientes) {
			return response()->json(['message' => 'No se puede cerrar caja con ventas pendientes'], 422);
		}

		DB::transaction(function () use ($caja) {
			$movs = MovimientoCaja::where('caja_id', $caja->id)->get();
			$ingresos = (float) $movs->where('tipo', 'ingreso')->sum('monto');
			$egresos = (float) $movs->where('tipo', 'egreso')->sum('monto');
			$caja->total_ventas = $ingresos;
			$caja->monto_final = (float) $caja->monto_inicial + $ingresos - $egresos;
			$caja->fecha_cierre = now();
			$caja->estado = 'cerrada';
			$caja->save();
		});

		return response()->json(['message' => 'Caja cerrada']);
	}
}


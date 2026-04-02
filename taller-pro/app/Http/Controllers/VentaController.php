<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Servicio;
use App\Models\Caja;
use App\Models\MovimientoCaja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class VentaController extends Controller
{
	public function index()
	{
		$hoy = now()->toDateString();
		$ventas = Venta::with('cliente')
			->whereDate('created_at', $hoy)
			->orderByDesc('created_at')
			->get(['id','cliente_id','total','estado','created_at']);

		return response()->json($ventas->map(function ($v) {
			return [
				'id' => sprintf('VEN-%03d', $v->id),
				'cliente' => optional($v->cliente)->nombre ?? '—',
				'total' => $v->total,
				'estado' => $v->estado,
				'fecha' => $v->created_at->format('Y-m-d H:i'),
			];
		}));
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'cliente_id' => ['required', 'exists:clientes,id'],
			'items' => ['required', 'array', 'min:1'],
			'items.*.tipo' => ['required', Rule::in(['producto','servicio'])],
			'items.*.id' => ['required', 'integer'],
			'items.*.cantidad' => ['required', 'integer', 'min:1'],
			'descuento' => ['nullable', 'numeric', 'min:0', 'max:30'],
		]);

		$userId = $request->user()->id;
		$descuentoPct = (float) ($data['descuento'] ?? 0);
		// Regla: solo admin puede >0 (se puede reforzar con middleware si se desea)
		if ($descuentoPct > 0 && optional($request->user()->rol)->nombre !== 'admin') {
			return response()->json(['message' => 'Solo admin puede aplicar descuento'], 403);
		}

		return DB::transaction(function () use ($data, $userId, $descuentoPct) {
			$subtotal = 0;
			$detalles = [];

			foreach ($data['items'] as $it) {
				if ($it['tipo'] === 'producto') {
					$producto = Producto::lockForUpdate()->findOrFail($it['id']);
					if ($producto->stock < $it['cantidad']) {
						abort(422, 'Stock insuficiente para '.$producto->nombre);
					}
					$producto->stock -= $it['cantidad'];
					$producto->save();

					$precio = (float) $producto->precio_venta;
					$lineaSubtotal = $precio * (int) $it['cantidad'];
					$subtotal += $lineaSubtotal;

					$detalles[] = [
						'tipo' => 'producto',
						'producto_id' => $producto->id,
						'servicio_id' => null,
						'cantidad' => (int) $it['cantidad'],
						'precio_unitario' => $precio,
						'subtotal' => $lineaSubtotal,
					];
				} else {
					$servicio = Servicio::findOrFail($it['id']);
					$precio = (float) $servicio->precio;
					$lineaSubtotal = $precio * (int) $it['cantidad'];
					$subtotal += $lineaSubtotal;

					$detalles[] = [
						'tipo' => 'servicio',
						'producto_id' => null,
						'servicio_id' => $servicio->id,
						'cantidad' => (int) $it['cantidad'],
						'precio_unitario' => $precio,
						'subtotal' => $lineaSubtotal,
					];
				}
			}

			$descuentoMonto = round($subtotal * ($descuentoPct / 100), 2);
			$total = max(0, $subtotal - $descuentoMonto);

			$venta = Venta::create([
				'cliente_id' => $data['cliente_id'] ?? null,
				'usuario_id' => $userId,
				'subtotal' => $subtotal,
				'descuento' => $descuentoMonto,
				'total' => $total,
				'estado' => 'pagado',
			]);

			foreach ($detalles as $d) {
				$d['venta_id'] = $venta->id;
				DetalleVenta::create($d);
			}

			// Si hay caja abierta, registrar ingreso automático
			$caja = Caja::where('estado', 'abierta')->latest('id')->first();
			if ($caja) {
				MovimientoCaja::create([
					'caja_id' => $caja->id,
					'venta_id' => $venta->id,
					'tipo' => 'ingreso',
					'monto' => $total,
					'descripcion' => 'Venta #'.$venta->id,
				]);
			}

			return response()->json(['venta_id' => $venta->id, 'total' => $total], 201);
		});
	}

	public function anular(Venta $venta)
	{
		if ($venta->estado === 'anulado') {
			return response()->json(['message' => 'Venta ya anulada'], 422);
		}

		DB::transaction(function () use ($venta) {
			// Devolver stock de productos
			foreach ($venta->detalles as $d) {
				if ($d->tipo === 'producto' && $d->producto_id) {
					Producto::where('id', $d->producto_id)->lockForUpdate()->increment('stock', $d->cantidad);
				}
			}
			$venta->estado = 'anulado';
			$venta->save();
		});

		return response()->json(['message' => 'Venta anulada']);
	}
}


<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
	public function index()
	{
		$productos = Producto::with('categoria')->orderBy('nombre')->get();
		$stockBajo = $productos->filter(fn($p) => (int)$p->stock <= (int)$p->stock_minimo)->count();

		return response()->json([
			'stock_bajo' => $stockBajo,
			'productos' => $productos->map(fn($p) => [
				'id' => $p->id,
				'nombre' => $p->nombre,
				'categoria' => optional($p->categoria)->nombre ?? '-',
				'stock' => (int)$p->stock,
				'stock_minimo' => (int)$p->stock_minimo,
				'precio_venta' => (float)$p->precio_venta,
				'bajo' => (int)$p->stock <= (int)$p->stock_minimo,
			]),
		]);
	}

	public function categorias()
	{
		return response()->json(Categoria::orderBy('nombre')->get(['id','nombre']));
	}

	public function storeProducto(Request $request)
	{
		$data = $request->validate([
			'nombre' => ['required', 'string', 'max:255'],
			'categoria_id' => ['nullable', 'exists:categorias,id'],
			'stock' => ['required', 'integer', 'min:0'],
			'stock_minimo' => ['required', 'integer', 'min:0'],
			'precio_venta' => ['required', 'numeric', 'min:0'],
			'descripcion' => ['nullable', 'string'],
		]);

		$producto = Producto::create([
			'nombre' => $data['nombre'],
			'descripcion' => $data['descripcion'] ?? null,
			'categoria_id' => $data['categoria_id'] ?? null,
			'precio_compra' => 0,
			'precio_venta' => $data['precio_venta'],
			'stock' => $data['stock'],
			'stock_minimo' => $data['stock_minimo'],
			'unidad' => 'unidad',
			'activo' => true,
		]);

		MovimientoStock::create([
			'producto_id' => $producto->id,
			'usuario_id' => $request->user()->id,
			'tipo' => 'ingreso',
			'cantidad' => (int)$data['stock'],
			'cantidad_anterior' => 0,
			'cantidad_nueva' => (int)$data['stock'],
			'motivo' => 'Stock inicial',
		]);

		return response()->json($producto, 201);
	}

	public function aumentarStock(Request $request, Producto $producto)
	{
		$data = $request->validate([
			'cantidad' => ['required', 'integer', 'min:1'],
			'motivo' => ['required', 'string', 'max:255'],
		]);

		DB::transaction(function () use ($request, $producto, $data) {
			$anterior = (int)$producto->stock;
			$nuevo = $anterior + (int)$data['cantidad'];
			$producto->stock = $nuevo;
			$producto->save();

			MovimientoStock::create([
				'producto_id' => $producto->id,
				'usuario_id' => $request->user()->id,
				'tipo' => 'ingreso',
				'cantidad' => (int)$data['cantidad'],
				'cantidad_anterior' => $anterior,
				'cantidad_nueva' => $nuevo,
				'motivo' => $data['motivo'],
			]);
		});

		return response()->json(['message' => 'Stock actualizado']);
	}
}


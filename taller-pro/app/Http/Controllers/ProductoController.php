<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
	public function index(Request $request)
	{
		$q = $request->query('q');
		$items = Producto::when($q, fn($x) => $x->where('nombre', 'like', '%'.$q.'%'))
			->orderBy('nombre')
			->paginate(20);
		return response()->json($items);
	}

	public function all()
	{
		return response()->json(
			Producto::where('activo', true)
				->where('stock', '>', 0)
				->orderBy('nombre')
				->get(['id', 'nombre', 'precio_venta', 'stock'])
		);
	}
}


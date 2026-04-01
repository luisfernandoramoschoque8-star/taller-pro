<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductoSeeder extends Seeder
{
	public function run(): void
	{
		$now = Carbon::now();
		$cat = DB::table('categorias')->pluck('id', 'nombre');

		$rows = [
			[
				'nombre' => 'Aceite 5W-30',
				'descripcion' => 'Aceite multigrado',
				'categoria_id' => $cat['Lubricantes'] ?? null,
				'precio_compra' => 60,
				'precio_venta' => 85,
				'stock' => 20,
				'stock_minimo' => 5,
				'unidad' => 'unidad',
				'activo' => true,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'nombre' => 'Filtro de aceite',
				'descripcion' => 'Filtro estándar',
				'categoria_id' => $cat['Filtros'] ?? null,
				'precio_compra' => 30,
				'precio_venta' => 45,
				'stock' => 15,
				'stock_minimo' => 5,
				'unidad' => 'unidad',
				'activo' => true,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'nombre' => 'Pastillas de freno',
				'descripcion' => 'Juego delantero',
				'categoria_id' => $cat['Frenos'] ?? null,
				'precio_compra' => 120,
				'precio_venta' => 180,
				'stock' => 10,
				'stock_minimo' => 4,
				'unidad' => 'juego',
				'activo' => true,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'nombre' => 'Batería 12V',
				'descripcion' => 'Batería automotriz',
				'categoria_id' => $cat['Eléctrico'] ?? null,
				'precio_compra' => 480,
				'precio_venta' => 650,
				'stock' => 8,
				'stock_minimo' => 3,
				'unidad' => 'unidad',
				'activo' => true,
				'created_at' => $now,
				'updated_at' => $now,
			],
		];

		DB::table('productos')->upsert(
			$rows,
			['nombre'],
			['descripcion', 'categoria_id', 'precio_compra', 'precio_venta', 'stock', 'stock_minimo', 'unidad', 'activo', 'updated_at']
		);
	}
}


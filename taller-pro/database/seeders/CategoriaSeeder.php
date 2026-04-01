<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CategoriaSeeder extends Seeder
{
	public function run(): void
	{
		$now = Carbon::now();
		DB::table('categorias')->upsert([
			['nombre' => 'Lubricantes', 'created_at' => $now, 'updated_at' => $now],
			['nombre' => 'Filtros', 'created_at' => $now, 'updated_at' => $now],
			['nombre' => 'Frenos', 'created_at' => $now, 'updated_at' => $now],
			['nombre' => 'Eléctrico', 'created_at' => $now, 'updated_at' => $now],
		], ['nombre'], ['updated_at']);
	}
}


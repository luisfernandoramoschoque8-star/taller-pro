<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ServicioSeeder extends Seeder
{
	public function run(): void
	{
		$now = Carbon::now();
		DB::table('servicios')->upsert([
			[
				'nombre' => 'Cambio de aceite',
				'descripcion' => 'Cambio de aceite y filtro',
				'precio' => 45,
				'duracion_minutos' => 30,
				'activo' => true,
				'created_at' => $now, 'updated_at' => $now,
			],
			[
				'nombre' => 'Alineación y balanceo',
				'descripcion' => 'Alineación y balanceo de ruedas',
				'precio' => 31,
				'duracion_minutos' => 45,
				'activo' => true,
				'created_at' => $now, 'updated_at' => $now,
			],
			[
				'nombre' => 'Reparación frenos',
				'descripcion' => 'Diagnóstico y reparación de frenos',
				'precio' => 28,
				'duracion_minutos' => 60,
				'activo' => true,
				'created_at' => $now, 'updated_at' => $now,
			],
			[
				'nombre' => 'Diagnóstico motor',
				'descripcion' => 'Escaneo y diagnóstico de motor',
				'precio' => 20,
				'duracion_minutos' => 40,
				'activo' => true,
				'created_at' => $now, 'updated_at' => $now,
			],
		], ['nombre'], ['descripcion', 'precio', 'duracion_minutos', 'activo', 'updated_at']);
	}
}


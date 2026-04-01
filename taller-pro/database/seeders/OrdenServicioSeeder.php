<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class OrdenServicioSeeder extends Seeder
{
	public function run(): void
	{
		$now = Carbon::now();
		$data = [
			[
				'codigo' => 'SRV-001',
				'cliente_id' => DB::table('clientes')->value('id'),
				'vehiculo' => 'Toyota Corolla 2018',
				'servicio_id' => DB::table('servicios')->value('id'),
				'mecanico' => 'Carlos Gómez',
				'fecha' => $now->copy()->setTime(9, 0, 0),
				'estado' => 'completado',
				'total' => 205,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'codigo' => 'SRV-002',
				'cliente_id' => null,
				'vehiculo' => 'Honda Civic 2020',
				'servicio_id' => null,
				'mecanico' => 'Luis Ramírez',
				'fecha' => $now->copy()->setTime(10, 30, 0),
				'estado' => 'en_proceso',
				'total' => 250,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'codigo' => 'SRV-003',
				'cliente_id' => null,
				'vehiculo' => 'Nissan Sentra 2019',
				'servicio_id' => null,
				'mecanico' => null,
				'fecha' => $now->copy()->setTime(14, 0, 0),
				'estado' => 'pendiente',
				'total' => 330,
				'created_at' => $now,
				'updated_at' => $now,
			],
			[
				'codigo' => 'SRV-004',
				'cliente_id' => null,
				'vehiculo' => 'Mazda 3 2021',
				'servicio_id' => null,
				'mecanico' => 'Carlos Gómez',
				'fecha' => $now->copy()->subDay()->setTime(11, 0, 0),
				'estado' => 'completado',
				'total' => 200,
				'created_at' => $now,
				'updated_at' => $now,
			],
		];
		DB::table('ordenes_servicio')->upsert($data, ['codigo']);
	}
}


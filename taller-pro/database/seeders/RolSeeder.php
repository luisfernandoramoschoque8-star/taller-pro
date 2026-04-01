<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RolSeeder extends Seeder
{
	public function run(): void
	{
		$now = Carbon::now();
		$roles = [
			['nombre' => 'admin', 'descripcion' => 'Administrador del sistema', 'created_at' => $now, 'updated_at' => $now],
			['nombre' => 'empleado', 'descripcion' => 'Empleado de ventas y servicios', 'created_at' => $now, 'updated_at' => $now],
			['nombre' => 'almacenero', 'descripcion' => 'Gestor de inventario y stock', 'created_at' => $now, 'updated_at' => $now],
		];

		DB::table('roles')->upsert($roles, ['nombre'], ['descripcion', 'updated_at']);
	}
}


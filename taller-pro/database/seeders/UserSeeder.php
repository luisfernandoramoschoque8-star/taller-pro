<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
	public function run(): void
	{
		$rolIds = DB::table('roles')->pluck('id', 'nombre');

		User::updateOrCreate(
			['email' => 'admin@tallerpro.com'],
			[
				'name' => 'Carlos Admin',
				'password' => Hash::make('admin123'),
				'rol_id' => $rolIds['admin'] ?? null,
				'activo' => true,
			]
		);

		User::updateOrCreate(
			['email' => 'empleado@tallerpro.com'],
			[
				'name' => 'María Empleado',
				'password' => Hash::make('emp123'),
				'rol_id' => $rolIds['empleado'] ?? null,
				'activo' => true,
			]
		);

		User::updateOrCreate(
			['email' => 'almacen@tallerpro.com'],
			[
				'name' => 'Luis Almacenero',
				'password' => Hash::make('alm123'),
				'rol_id' => $rolIds['almacenero'] ?? null,
				'activo' => true,
			]
		);
	}
}


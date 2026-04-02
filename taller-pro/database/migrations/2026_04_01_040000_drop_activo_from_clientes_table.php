<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		if (Schema::hasColumn('clientes', 'activo')) {
			Schema::table('clientes', function (Blueprint $table) {
				$table->dropColumn('activo');
			});
		}
	}

	public function down(): void
	{
		if (!Schema::hasColumn('clientes', 'activo')) {
			Schema::table('clientes', function (Blueprint $table) {
				$table->boolean('activo')->default(true)->after('ci');
			});
		}
	}
};


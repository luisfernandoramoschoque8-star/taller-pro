<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('movimientos_stock', function (Blueprint $table) {
			$table->id();
			$table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
			$table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
			$table->enum('tipo', ['ingreso', 'egreso', 'ajuste']);
			$table->integer('cantidad');
			$table->integer('cantidad_anterior');
			$table->integer('cantidad_nueva');
			$table->string('motivo')->nullable();
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('movimientos_stock');
	}
};


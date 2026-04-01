<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('caja', function (Blueprint $table) {
			$table->id();
			$table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
			$table->timestamp('fecha_apertura')->nullable();
			$table->timestamp('fecha_cierre')->nullable();
			$table->decimal('monto_inicial', 12, 2)->default(0);
			$table->decimal('monto_final', 12, 2)->default(0);
			$table->decimal('total_ventas', 12, 2)->default(0);
			$table->enum('estado', ['abierta', 'cerrada'])->default('cerrada');
			$table->text('observaciones')->nullable();
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('caja');
	}
};


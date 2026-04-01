<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('movimientos_caja', function (Blueprint $table) {
			$table->id();
			$table->foreignId('caja_id')->constrained('caja')->cascadeOnDelete();
			$table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
			$table->enum('tipo', ['ingreso', 'egreso']);
			$table->decimal('monto', 12, 2);
			$table->string('descripcion')->nullable();
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('movimientos_caja');
	}
};


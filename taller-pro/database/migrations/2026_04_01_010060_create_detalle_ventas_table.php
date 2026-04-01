<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('detalle_ventas', function (Blueprint $table) {
			$table->id();
			$table->foreignId('venta_id')->constrained('ventas')->cascadeOnDelete();
			$table->enum('tipo', ['producto', 'servicio']);
			$table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
			$table->foreignId('servicio_id')->nullable()->constrained('servicios')->nullOnDelete();
			$table->integer('cantidad')->default(1);
			$table->decimal('precio_unitario', 12, 2);
			$table->decimal('subtotal', 12, 2);
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('detalle_ventas');
	}
};


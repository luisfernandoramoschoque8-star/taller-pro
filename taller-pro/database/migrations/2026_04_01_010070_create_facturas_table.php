<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('facturas', function (Blueprint $table) {
			$table->id();
			$table->foreignId('venta_id')->constrained('ventas')->cascadeOnDelete();
			$table->string('numero_factura')->unique();
			$table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
			$table->string('nit_ci')->nullable();
			$table->string('razon_social')->nullable();
			$table->decimal('total', 12, 2);
			$table->enum('estado', ['emitida', 'anulada'])->default('emitida');
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('facturas');
	}
};


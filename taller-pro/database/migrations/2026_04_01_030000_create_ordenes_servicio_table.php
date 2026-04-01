<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('ordenes_servicio', function (Blueprint $table) {
			$table->id();
			$table->string('codigo')->unique(); // SRV-001
			$table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
			$table->string('vehiculo')->nullable();
			$table->foreignId('servicio_id')->nullable()->constrained('servicios')->nullOnDelete();
			$table->string('mecanico')->nullable(); // simple texto para demo
			$table->dateTime('fecha')->nullable();
			$table->enum('estado', ['pendiente', 'en_proceso', 'completado'])->default('pendiente');
			$table->decimal('total', 12, 2)->default(0);
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('ordenes_servicio');
	}
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('ventas', function (Blueprint $table) {
			$table->id();
			$table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
			$table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
			$table->decimal('subtotal', 12, 2)->default(0);
			$table->decimal('descuento', 12, 2)->default(0);
			$table->decimal('total', 12, 2)->default(0);
			$table->enum('estado', ['pendiente', 'pagado', 'anulado'])->default('pendiente');
			$table->text('observaciones')->nullable();
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('ventas');
	}
};


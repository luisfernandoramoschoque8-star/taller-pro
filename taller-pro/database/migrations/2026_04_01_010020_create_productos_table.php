<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('productos', function (Blueprint $table) {
			$table->id();
			$table->string('nombre');
			$table->text('descripcion')->nullable();
			$table->foreignId('categoria_id')->nullable()->constrained('categorias')->nullOnDelete();
			$table->decimal('precio_compra', 12, 2)->default(0);
			$table->decimal('precio_venta', 12, 2)->default(0);
			$table->integer('stock')->default(0);
			$table->integer('stock_minimo')->default(0);
			$table->string('unidad')->default('unidad');
			$table->boolean('activo')->default(true);
			$table->timestamps();
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('productos');
	}
};


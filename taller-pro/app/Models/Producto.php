<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Producto extends Model
{
	use HasFactory;

	protected $table = 'productos';
	protected $fillable = [
		'nombre', 'descripcion', 'categoria_id',
		'precio_compra', 'precio_venta',
		'stock', 'stock_minimo', 'unidad', 'activo',
	];

	public function categoria(): BelongsTo
	{
		return $this->belongsTo(Categoria::class);
	}
}


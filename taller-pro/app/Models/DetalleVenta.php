<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
	use HasFactory;

	protected $table = 'detalle_ventas';
	protected $fillable = [
		'venta_id', 'tipo', 'producto_id', 'servicio_id',
		'cantidad', 'precio_unitario', 'subtotal',
	];

	public function venta(): BelongsTo { return $this->belongsTo(Venta::class); }
	public function producto(): BelongsTo { return $this->belongsTo(Producto::class); }
	public function servicio(): BelongsTo { return $this->belongsTo(Servicio::class); }
}


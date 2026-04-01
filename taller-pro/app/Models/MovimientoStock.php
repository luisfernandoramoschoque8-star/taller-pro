<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoStock extends Model
{
	use HasFactory;

	protected $table = 'movimientos_stock';
	protected $fillable = [
		'producto_id', 'usuario_id', 'tipo', 'cantidad',
		'cantidad_anterior', 'cantidad_nueva', 'motivo',
	];

	public function producto(): BelongsTo { return $this->belongsTo(Producto::class); }
	public function usuario(): BelongsTo { return $this->belongsTo(User::class, 'usuario_id'); }
}


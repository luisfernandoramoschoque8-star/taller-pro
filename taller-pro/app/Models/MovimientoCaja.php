<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoCaja extends Model
{
	use HasFactory;

	protected $table = 'movimientos_caja';
	protected $fillable = ['caja_id', 'venta_id', 'tipo', 'monto', 'descripcion'];

	public function caja(): BelongsTo { return $this->belongsTo(Caja::class, 'caja_id'); }
	public function venta(): BelongsTo { return $this->belongsTo(Venta::class, 'venta_id'); }
}


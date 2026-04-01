<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Caja extends Model
{
	use HasFactory;

	protected $table = 'caja';
	protected $fillable = [
		'usuario_id', 'fecha_apertura', 'fecha_cierre',
		'monto_inicial', 'monto_final', 'total_ventas',
		'estado', 'observaciones',
	];

	public function usuario(): BelongsTo { return $this->belongsTo(User::class, 'usuario_id'); }
	public function movimientos(): HasMany { return $this->hasMany(MovimientoCaja::class, 'caja_id'); }
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrdenServicio extends Model
{
	use HasFactory;

	protected $table = 'ordenes_servicio';
	protected $fillable = ['codigo', 'cliente_id', 'vehiculo', 'servicio_id', 'mecanico', 'fecha', 'estado', 'total'];

	public function cliente(): BelongsTo
	{
		return $this->belongsTo(Cliente::class);
	}

	public function servicio(): BelongsTo
	{
		return $this->belongsTo(Servicio::class);
	}
}


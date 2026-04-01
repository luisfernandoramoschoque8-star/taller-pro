<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Servicio extends Model
{
	use HasFactory;

	protected $table = 'servicios';
	protected $fillable = ['nombre', 'descripcion', 'precio', 'duracion_minutos', 'activo'];

	public function scopeActivos(Builder $q): Builder
	{
		return $q->where('activo', true);
	}
}


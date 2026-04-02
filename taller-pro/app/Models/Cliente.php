<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Cliente extends Model
{
	use HasFactory;

	protected $table = 'clientes';
	protected $fillable = ['nombre', 'telefono', 'email', 'direccion', 'ci'];

	public function scopeSearch(Builder $query, ?string $term): Builder
	{
		if (!$term) return $query;
		$like = '%'.$term.'%';
		return $query->where(function ($q) use ($like) {
			$q->where('nombre', 'like', $like)
				->orWhere('ci', 'like', $like);
		});
	}
}


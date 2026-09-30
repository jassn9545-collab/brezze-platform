<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCatalog extends Model
{
    protected $fillable = [
        'provider_id',
        'heading',
        'description',
        'price',
        'images',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'array',
        'status' => 'boolean',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}

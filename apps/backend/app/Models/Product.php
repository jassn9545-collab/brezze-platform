<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'type',
        'carat',
        'description',
        'specification',
        'price',
        'weight',
        'status',
        'category_id',
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
}

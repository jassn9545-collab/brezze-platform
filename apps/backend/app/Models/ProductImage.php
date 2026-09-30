<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'image'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

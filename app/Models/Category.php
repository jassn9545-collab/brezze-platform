<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'name',
        'slug',
        'photo',
    ];

    public $timestamps = false; // because you have created_at & modify_at (not updated_at)

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'modify_at';

}
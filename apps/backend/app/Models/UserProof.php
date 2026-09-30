<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserProof extends Model
{
    protected $fillable = [
        'user_id',
        'proof_type',
        'id_number',
        'expiry_date',
        'front_image',
        'back_image',
        'is_verified'
    ];
}
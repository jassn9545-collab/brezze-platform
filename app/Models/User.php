<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'dob',
        'phone',
        'gender',
        'user_type',
        'alternate_phone',
        'is_verified',
        'refral_code',
        'refrence',
        'latitude',
        'longitude',
        'skills',
        'experience',
        'street_address',
        'city',
        'state',
        'country',
        'pincode',
        'profile_image',
        'profile_title',
        'profile_description',
        'stripe_account_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function proof()
    {
        return $this->hasOne(UserProof::class);
    }
}

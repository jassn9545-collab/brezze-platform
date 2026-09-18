<?php

class UserProfile extends Model
{
    protected $fillable = [

        'user_type',
        'full_name',
        'email',
        'phone',
        'password',
        'profile_photo',

        'dob',
        'gender',

        'country',
        'city',
        'address',

        'skills',
        'experience_years',
        'hourly_rate',

        'company_name',
        'website',

        'bio',

        'account_status',
        'is_verified'
    ];

    protected $casts = [
        'skills' => 'array',
        'is_verified' => 'boolean',
    ];

    protected $hidden = ['password'];
}
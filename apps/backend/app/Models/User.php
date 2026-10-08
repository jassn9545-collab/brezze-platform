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
        'is_featured',
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
        'stripe_customer_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_verified' => 'integer',
    ];

    public function proof()
    {
        return $this->hasOne(UserProof::class);
    }

    public function customerPayments()
    {
        return $this->hasMany(Payment::class, 'customer_id');
    }

    public function providerPayments()
    {
        return $this->hasMany(Payment::class, 'provider_id');
    }

    public function serviceCatalogs()
    {
        return $this->hasMany(ServiceCatalog::class, 'provider_id');
    }

    public function appNotifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function supportRequests()
    {
        return $this->hasMany(SupportRequest::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'user_id');
    }

    public function bids()
    {
        return $this->hasMany(Bid::class, 'user_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'given_by');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'given_to');
    }

    public function withdrawalRequests()
    {
        return $this->hasMany(WithdrawalRequest::class, 'provider_id');
    }

    public function disputesOpened()
    {
        return $this->hasMany(Dispute::class, 'opened_by');
    }

    public function disputesAgainst()
    {
        return $this->hasMany(Dispute::class, 'against_user_id');
    }
}

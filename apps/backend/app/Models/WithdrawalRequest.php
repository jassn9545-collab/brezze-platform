<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WithdrawalRequest extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PAID = 'paid';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'provider_id',
        'requested_amount',
        'currency',
        'status',
        'payment_reference',
        'provider_notes',
        'admin_notes',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}

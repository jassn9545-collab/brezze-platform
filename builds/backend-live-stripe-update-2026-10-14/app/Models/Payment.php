<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_SUCCEEDED = 'succeeded';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    public const COMMISSION_PERCENT = 10;

    protected $fillable = [
        'project_id',
        'customer_id',
        'provider_id',
        'stripe_payment_intent_id',
        'transaction_id',
        'currency',
        'amount_minor',
        'commission_minor',
        'provider_earnings_minor',
        'amount',
        'commission_amount',
        'provider_earnings',
        'commission_rate',
        'status',
        'attempts',
        'failure_code',
        'failure_message',
        'paid_at',
        'failed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'provider_earnings' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}

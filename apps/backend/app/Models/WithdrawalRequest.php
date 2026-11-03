<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WithdrawalRequest extends Model
{
    public const STATUS_AWAITING_SETTLEMENT = 'awaiting_settlement';

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_IN_TRANSIT = 'in_transit';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELED = 'canceled';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'stripe_submission_attempt',
        'created_at',
        'stripe_submission_started_at',
        'provider_id',
        'requested_amount',
        'currency',
        'status',
        'payment_reference',
        'stripe_payout_id',
        'idempotency_key',
        'destination',
        'method',
        'arrival_at',
        'failure_code',
        'failure_message',
        'provider_notes',
        'admin_notes',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'stripe_submission_started_at' => 'datetime',
        'requested_amount' => 'decimal:2',
        'processed_at' => 'datetime',
        'arrival_at' => 'datetime',
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

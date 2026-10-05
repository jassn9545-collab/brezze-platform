<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceBooking extends Model
{
    protected $fillable = [
        'service_catalog_id',
        'client_id',
        'provider_id',
        'note',
        'price',
        'status',
        'project_id',
        'conversation_id',
        'responded_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'responded_at' => 'datetime',
    ];

    public function catalog()
    {
        return $this->belongsTo(ServiceCatalog::class, 'service_catalog_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function conversation()
    {
        return $this->belongsTo(ChatConversation::class);
    }
}

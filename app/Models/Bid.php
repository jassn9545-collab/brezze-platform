<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    protected $table = 'bids'; // change if your table name is different

    protected $primaryKey = 'id';

    public $timestamps = false; // because you don't have updated_at

    protected $fillable = [
        'user_id',
        'project_id',
        'bid_amount',
        'freelancer_name',
        'freelancer_image',
        'attachment',
        'date_time',
        'is_hired',
        'modify_at',
        'end_date_time',
        'work_attachment',
        'work_description'
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'is_hired'  => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function bids()
    {
        return $this->hasMany(\App\Models\Bid::class, 'project_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
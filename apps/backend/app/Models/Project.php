<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'description',
        'address',
        'city',
        'country',
        'pincode',
        'latitude',
        'longitude',
        'budget',
        'status',
        'user_id'
    ];

    // 👇 Append custom attribute in response
    protected $appends = ['job_applied'];

    /**
     * Get all images of project
     */
    public function images()
    {
        return $this->hasMany(ProjectImage::class, 'project_id');
    }

    /**
     * Get single (latest) image
     */
    public function image()
    {
        return $this->hasOne(ProjectImage::class, 'project_id')->latest();
    }

    /**
     * Get all bids of project
     */
    public function bids()
    {
        return $this->hasMany(\App\Models\Bid::class, 'project_id');
    }

    /**
     * Get hired bid (selected freelancer)
     */
    public function hiredBid()
    {
        return $this->hasOne(\App\Models\Bid::class, 'project_id')
                    ->where('is_hired', 1);
    }
    public function is_hired()
    {
        return $this->hasMany(\App\Models\Bid::class, 'project_id')
                    ->where('is_hired', 1);
    }

    /**
     * Check if current logged-in user has applied
     */
    public function getJobAppliedAttribute()
    {
        // If no user logged in
        if (!auth()->check()) {
            return false;
        }

        return $this->bids()
            ->where('user_id', auth()->id())
            ->exists();
    }

    public function savedProjects()
    {
        return $this->hasMany(\App\Models\SavedJob::class, 'project_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function client()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'project_id');
    }
}

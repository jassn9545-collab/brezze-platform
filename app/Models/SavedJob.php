<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedJob extends Model
{
    protected $table = 'saved_projects'; // make sure your table name matches

    protected $fillable = [
        'project_id',
        'user_id',
    ];

    public $timestamps = true; // since you have created_at & updated_at

    // If updated_at column is nullable or missing default
    const UPDATED_AT = 'updated_at';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public static function getByProjectAndUser($projectId, $userId)
    {
        return self::where('project_id', $projectId)
                    ->where('user_id', $userId)
                    ->first();
    }

    public function bids()
    {
        return $this->hasMany(\App\Models\Bid::class, 'project_id');
    }

}
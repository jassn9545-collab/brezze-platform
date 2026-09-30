<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectImage extends Model
{
    protected $table = 'project_images';
    

    protected $fillable = [
        'project_id',
        'image'
    ];

    public $timestamps = false; // since only created_at exists

    /**
     * Belongs to project
     */
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
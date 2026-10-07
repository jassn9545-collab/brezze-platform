<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';

    protected $fillable = [
        'given_by',
        'given_to',
        'job_id',
        'star',
        'review',
        'review_to',
    ];

    protected $casts = [
        'star' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Who gave the review
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'given_by');
    }

    /**
     * Who received the review
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'given_to');
    }

    /**
     * Related Job
     */
    public function job()
    {
        return $this->belongsTo(Project::class, 'job_id');
    }

    public static function receivedSummary(int $userId, string $reviewTo): array
    {
        $query = static::query()
            ->where('given_to', $userId)
            ->where('review_to', $reviewTo);

        $reviewCount = (clone $query)->count();
        $averageRating = $reviewCount > 0
            ? round((float) (clone $query)->avg('star'), 1)
            : 0.0;

        return [
            'avg_rating' => $averageRating,
            'review_count' => $reviewCount,
            'reviews' => $query
                ->with([
                    'reviewer:id,name,profile_image',
                    'job:id,title',
                ])
                ->latest('id')
                ->get(),
        ];
    }
}

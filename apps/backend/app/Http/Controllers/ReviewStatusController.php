<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewStatusController extends Controller
{
    public function __invoke(Project $project): JsonResponse
    {
        $project->load('hiredBid');

        $userId = (int) auth()->id();
        $isCustomer = (int) $project->user_id === $userId;
        $isHiredProvider = $project->hiredBid
            && (int) $project->hiredBid->user_id === $userId;

        if (!$isCustomer && !$isHiredProvider) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Project not found.',
            ], 404);
        }

        $review = Review::query()
            ->where('job_id', $project->id)
            ->where('given_by', $userId)
            ->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Review status fetched successfully.',
            'data' => [
                'project_id' => $project->id,
                'project_status' => $project->status,
                'can_review' => $project->status === 'completed' && !$review,
                'has_reviewed' => (bool) $review,
                'review' => $review,
            ],
        ]);
    }
}

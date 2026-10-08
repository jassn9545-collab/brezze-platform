<?php

namespace App\Http\Controllers\Api\Freelancer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserProof;
use Illuminate\Support\Facades\Hash;
use Mail;
use Illuminate\Support\Facades\Cache;
use App\Traits\ApiResponse;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\Payment;
use App\Models\Review;
use App\Services\RealtimeNotifier;
use App\Models\Bid;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FreelancerJobController extends BaseFreelancerController
{
    use ApiResponse;

    public function latestJobs(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);
        $userId = auth()->id();

        $query = Project::withCount('bids')
            ->where('status', 'active')
            ->withExists(['savedProjects as saved' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->latest();

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->success([
            'jobs' => $paginator->items(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ], 'jobs retrieved successfully.');
    }

    public function applyJob(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx',
            'bid_amount' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:99999999.99'],
        ]);
        
        if ($validator->fails()) {
            return $this->error('Validation error.', 400,$validator->errors());
        }
        $user = auth()->user();
        $project = Project::find($request->project_id);
        if (!$project) {
            return $this->error('Job not found.', 404);
        }

        $existingBid = Bid::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();
        if ($existingBid) {
            $project = Project::withCount('bids')->find($project->id);
            $project->setAttribute('already_applied', true);
            $project->setAttribute('bid_id', $existingBid->id);
            $project->setAttribute('bid_amount', $existingBid->bid_amount);

            return $this->success($project, 'You have already applied for this job.');
        }

        if ($project->status !== 'active') {
            return $this->error('This job is no longer accepting applications.', 409);
        }

        $filename = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/bids'), $filename);
        }
        $result = DB::transaction(function () use ($project, $user, $request, $filename) {
            $lockedProject = Project::query()->lockForUpdate()->find($project->id);
            $existingBid = Bid::where('project_id', $lockedProject->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingBid) {
                return ['bid' => $existingBid, 'created' => false];
            }

            if ($lockedProject->status !== 'active') {
                return ['error' => 'This job is no longer accepting applications.'];
            }

            return [
                'bid' => Bid::create([
                    'project_id' => $lockedProject->id,
                    'user_id' => $user->id,
                    'bid_amount' => $request->bid_amount,
                    'freelancer_name' => $user->name ?? null,
                    'freelancer_image' => $user->profile_image ?? null,
                    'attachment' => $filename ? 'uploads/bids/'.$filename : null,
                    'date_time' => now(),
                    'is_hired' => 0,
                ]),
                'created' => true,
            ];
        });

        if (isset($result['error'])) {
            return $this->error($result['error'], 409);
        }

        $bid = $result['bid'];
        $created = $result['created'];
        $project = Project::withCount('bids')->find($project->id);
        $project->setAttribute('already_applied', !$created);
        $project->setAttribute('bid_id', $bid->id);
        $project->setAttribute('bid_amount', $bid->bid_amount);

        if ($created) {
            app(RealtimeNotifier::class)->notify(
                $project->user_id,
                'New job application',
                ($user->name ?: 'A provider').' applied for '.$project->title.'.',
                'job_application',
                'project',
                $project->id,
                ['bid_id' => $bid->id]
            );
        }

        return $this->success(
            $project,
            $created ? 'Job application submitted successfully.' : 'You have already applied for this job.'
        );
    }

    public function jobDetail(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
        ]);
        
        if ($validator->fails()) {
            return $this->error('Validation error.', 400,$validator->errors());
        }

        $project = Project::with(['bids', 'images','client:id,name,profile_image'])->find($request->project_id);

        if (!$project) {
            return $this->error('Project not found.', 400);
        }
        $project->base_url = url('/');

        return $this->success($project, 'Job details retrieved successfully.');
    }

    public function saveJob(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
        ]);
        
        if ($validator->fails()) {
            return $this->error('Validation error.', 400, $validator->errors());
        }

        $user = auth()->user();

        $alreadySaved = \App\Models\SavedJob::where('project_id', $request->project_id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadySaved) {
                $savedJobs = \App\Models\SavedJob::with('project')
                ->where('user_id', $user->id)
                ->latest()
                ->get();

                return $this->success($savedJobs, 'Job saved successfully.');
        }

        \App\Models\SavedJob::create([
            'project_id' => $request->project_id,
            'user_id' => $user->id,
        ]);

        // Get all saved jobs with project details
        $savedJobs = \App\Models\SavedJob::with('project')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return $this->success($savedJobs, 'Job saved successfully.');
    }

    public function removeJob(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
        ]);
        
        if ($validator->fails()) {
            return $this->error('Validation error.', 400, $validator->errors());
        }

        $user = auth()->user();
        if( !\App\Models\SavedJob::where('project_id', $request->project_id)->where('user_id', $user->id)->exists() ) {
            return $this->error('Job not found in saved list.', 400, null);
        }
        \App\Models\SavedJob::where('project_id', $request->project_id)
            ->where('user_id', $user->id)
            ->delete();

        // Get all saved jobs with project details
        $savedJobs = \App\Models\SavedJob::with('project')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return $this->success($savedJobs, 'Job removed from saved list successfully.');
    }

    
    public function savedJobs(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $user = auth()->user();

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);

        $paginator = \App\Models\SavedJob::with('project')
            ->withCount('bids')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $jobs = $paginator->getCollection()->map(function ($item) {
            if (!$item->project) return null;

            return array_merge(
                $item->project->toArray(),
                [
                    'bids_count' => $item->bids_count,
                ]
            );
        })->filter()->values();

        // Replace collection
        $paginator->setCollection($jobs);

        return $this->success([
            'jobs' => $paginator->items(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ], 'Saved jobs retrieved successfully.');
    }

    public function activeJobs(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $user = auth()->user();

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);

        $paginator = \App\Models\Bid::with([
                'project' => function ($q) {
                    $q->withCount('bids')
                    ->with([
                        'user:id,name,profile_image',
                        'payment:id,project_id,provider_id,transaction_id,provider_earnings,status,paid_at',
                    ]);
                }
            ])
            ->where('user_id', $user->id)
            ->where('is_hired', 1)
            ->whereHas('project', function ($q) {
                $q->where('status', 'in progress');
            })
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $jobs = $paginator->getCollection()->map(function ($item) {
            if (!$item->project) return null;

            $payment = $item->project->payment;

            return array_merge(
                $item->project->toArray(),
                [
                    'bid_amount' => $item->bid_amount,
                    'bids_count' => $item->project->bids_count ?? 0,
                    'is_hired' => $item->is_hired,

                    'client_name' => $item->project->user->name ?? null,
                    'client_profile_pic' => $item->project->user->profile_image ?? null, // fixed key
                    'payment_status' => $payment?->status ?? 'unpaid',
                    'provider_earnings' => $payment?->provider_earnings,
                    'transaction_id' => $payment?->transaction_id,
                    'paid_at' => $payment?->paid_at?->toISOString(),
                ]
            );
        })->filter()->values();

        // Replace collection
        $paginator->setCollection($jobs);

        return $this->success([
            'jobs' => $paginator->items(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ], 'Active jobs retrieved successfully.');
    }

    public function appliedJobs(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $user = auth()->user();

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);

        $paginator = \App\Models\Bid::with('project')
            ->where('user_id', $user->id)
            ->where('is_hired', 0)
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $jobs = $paginator->getCollection()->map(function ($item) {
            if (!$item->project) return null;

            return array_merge(
                $item->project->toArray(),
                [
                    'bid_amount' => $item->bid_amount,
                    'bids_count' => $item->project->bids_count ?? 0,
                    'is_hired' => $item->is_hired,
                ]
            );
        })->filter()->values();

        // Replace collection
        $paginator->setCollection($jobs);

        return $this->success([
            'jobs' => $paginator->items(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ], 'Applied jobs retrieved successfully.');
    }

    public function completedJobs(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $user = auth()->user();

        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);

        $paginator = \App\Models\Bid::with([
                'project' => function ($q) {
                    $q->withCount('bids')
                    ->with('user:id,name,profile_image');
                }
            ])
            ->where('user_id', $user->id)
            ->where('is_hired', 1)
            ->whereHas('project', function ($q) {
                $q->where('status', 'completed');
            })
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $jobs = $paginator->getCollection()->map(function ($item) {
            if (!$item->project) return null;

            return array_merge(
                $item->project->toArray(),
                [
                    'bid_amount' => $item->bid_amount,
                    'bids_count' => $item->project->bids_count ?? 0,
                    'is_hired' => $item->is_hired,

                    'client_name' => $item->project->user->name ?? null,
                    'client_profile_pic' => $item->project->user->profile_image ?? null, // fixed key
                ]
            );
        })->filter()->values();

        // Replace collection
        $paginator->setCollection($jobs);

        return $this->success([
            'jobs' => $paginator->items(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ], 'Completed jobs retrieved successfully.');
    }

    public function myProfile(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $user = auth()->user();
        $user->proof = UserProof::where('user_id', $user->id)->first();
        $user->job_success_score = 100;
        $user->total_jobs = Payment::query()
            ->where('provider_id', $user->id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->count();
        $user->total_earnings = number_format((float) Payment::query()
            ->where('provider_id', $user->id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings'), 2, '.', '');
        $reviewSummary = Review::receivedSummary($user->id, 'freelancer');
        $user->avg_rating = $reviewSummary['avg_rating'];
        $user->review_count = $reviewSummary['review_count'];
        $user->reviews = $reviewSummary['reviews'];
        $user->is_top_rated = $user->review_count > 0
            && $user->avg_rating >= 4.5;
        $categoryIds = $user->skills ? explode(',', $user->skills) : [];

        $user->categories = \App\Models\Category::whereIn('id', $categoryIds)
        ->pluck('name');

        return $this->success($user, 'Profile retrieved successfully.');
    }

    public function profileUpdate(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $user = auth()->user();

        $validator = \Validator::make($request->all(), [
            'name' => 'required|string',
            'profile_image' => 'nullable|image',
            'skills' => 'nullable|string', // fixed (was wrong validation)
            'profile_title' => 'nullable|string',
            'profile_description' => 'nullable|string',
            'street_address' => 'nullable|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error.', 400, $validator->errors());
        }

        // Handle image upload
        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/user'), $filename);

            $user->profile_image = 'uploads/user/' . $filename;
        }

        // Update other fields
        $user->update([
            'name' => $request->name,
            'skills' => $request->skills,
            'profile_title' => $request->profile_title,
            'profile_description' => $request->profile_description,
            'street_address' => $request->street_address,
            'state' => $request->state,
            'zip' => $request->zip,
            // profile_image already handled above
        ]);

        $user->proof = UserProof::where('user_id', $user->id)->first();
        $user->job_success_score = 100;
        $user->total_jobs = Payment::query()
            ->where('provider_id', $user->id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->count();
        $user->total_earnings = number_format((float) Payment::query()
            ->where('provider_id', $user->id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings'), 2, '.', '');
        $reviewSummary = Review::receivedSummary($user->id, 'freelancer');
        $user->avg_rating = $reviewSummary['avg_rating'];
        $user->review_count = $reviewSummary['review_count'];
        $user->reviews = $reviewSummary['reviews'];
        $user->is_top_rated = $user->review_count > 0
            && $user->avg_rating >= 4.5;
        $categoryIds = $user->skills ? explode(',', $user->skills) : [];

        $user->categories = \App\Models\Category::whereIn('id', $categoryIds)
        ->pluck('name');
        return $this->success($user, 'Profile updated successfully.');
    }

    public function submitWork(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'work_attachment' => 'nullable|file|mimes:pdf,doc,docx,zip,jpg,jpeg,png',
            'work_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error.', 400, $validator->errors());
        }

        $bid = \App\Models\Bid::where('project_id', $request->project_id)
            ->where('user_id', auth()->id())
            ->where('is_hired', 1)
            ->whereHas('project', function ($query) {
                $query->where('status', 'in progress');
            })
            ->first();

        if (!$bid) {
            return $this->error('You are not hired for this job or job not found.', 400);
        }

        $filename = null;

        if ($request->hasFile('work_attachment')) {
            $file = $request->file('work_attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/work'), $filename);
        }

        // Here you can save the submitted work details in a new table (e.g., SubmittedWork) if needed
        // For simplicity, we will just update the bid with work details

        $bid->update([
            'work_attachment' => ($filename) ? 'uploads/work/' . $filename : null,
            'work_description' => $request->work_description,
            'end_date_time' => date('Y-m-d H:i:s'),
        ]);
        $clientEmail = $bid->project->user->email;
        $clientmessage = '<p>Dear ' . $bid->project->user->name . ',</p>';
        $clientmessage .= '<p>Work has been submitted for project: ' . $bid->project->title . '</p>';
        Mail::html($clientmessage, function ($message) use ($clientEmail) {
            $message->to($clientEmail)
                    ->subject('Work Submitted for Your Project');
        });

        app(RealtimeNotifier::class)->notify(
            $bid->project->user_id,
            'Work submitted',
            ($request->user()->name ?: 'Your provider').' submitted work for '.$bid->project->title.'.',
            'work_submitted',
            'project',
            $bid->project->id,
            ['status' => 'in progress'],
        );

        return $this->success(null, 'Work submitted successfully.');
    }

    public function submitReview(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'star' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error.', 400, $validator->errors());
        }

        $project = \App\Models\Project::with('hiredBid')->findOrFail($request->project_id);
        $reviewer = $request->user();
        $customerId = (int) $project->user_id;
        $providerId = (int) ($project->hiredBid?->user_id ?? 0);
        $reviewerId = (int) $reviewer->id;

        $isCustomer = $reviewerId === $customerId;
        $isProvider = $providerId > 0 && $reviewerId === $providerId;

        if ($project->status !== 'completed' || (! $isCustomer && ! $isProvider)) {
            return $this->error('You can only review completed projects.', 400);
        }

        $existingReview = \App\Models\Review::where('job_id', $project->id)
            ->where('given_by', $reviewerId)
            ->first();

        if ($existingReview) {
            $existingReview->setAttribute('already_reviewed', true);

            return response()->json([
                'status' => 'success',
                'message' => 'You have already reviewed this project.',
                'data' => $existingReview,
            ], 200);
        }

        $receiverId = $isCustomer ? $providerId : $customerId;
        $reviewTo = $isCustomer ? 'freelancer' : 'client';

        $review = \App\Models\Review::create([
            'given_by' => $reviewerId,
            'given_to' => $receiverId,
            'job_id' => $project->id,
            'star' => $request->star,
            'review' => $request->review,
            'review_to' => $reviewTo,
        ]);

        app(RealtimeNotifier::class)->notify(
            $receiverId,
            'New review received',
            ($reviewer->name ?: 'A user').' left a '.$request->star.'-star review for '.$project->title.'.',
            'review_received',
            'project',
            $project->id,
            ['review_id' => $review->id, 'rating' => (int) $request->star],
        );

        $review->setAttribute('already_reviewed', false);

        return response()->json([
            'status' => 'success',
            'message' => 'Review submitted successfully.',
            'data' => $review,
        ], 200);
    }
}

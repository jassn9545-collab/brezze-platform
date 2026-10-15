<?php

namespace App\Http\Controllers\Api\Client;

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
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Throwable;

class JobController extends BaseClientController
{
    use ApiResponse;

    public function createJob(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }
        // return $request->all();
        $validator = \Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'category'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'address'     => 'nullable|string',
            'city'        => 'nullable|string',
            'country'     => 'nullable|string',
            'pincode'     => 'nullable|string',
            'latitude'    => 'nullable|string',
            'longitude'   => 'nullable|string',
            'budget'      => 'nullable|string',

            // images optional
            'images.*'    => 'image|mimes:jpg,jpeg,png,webp',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $project = Project::create([
            'title'       => $request->title,
            'slug'        => Str::slug($request->title) . '-' . time(),
            'category'    => $request->category,
            'description' => $request->description,
            'address'     => $request->address,
            'city'        => $request->city,
            'country'     => $request->country,
            'pincode'     => $request->pincode,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'budget'      => $request->budget,
            'status'      => 'active',
            'user_id'     => auth()->id()
        ]);
        \Log::info($request->all());
        \Log::info($request->file('images'));
        if ($request->hasFile('images')) {

            foreach ($request->file('images') as $file) {

                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                $file->move(public_path('uploads/projects'), $filename);

                ProjectImage::create([
                    'project_id' => $project->id,
                    'image'      => 'uploads/projects/' . $filename
                ]);
            }
        }

        $myjobs = Project::where('user_id', auth()->id())->latest()->get();

        return $this->success([
            'jobs' => $myjobs,
        ], 'Job created successfully.');
    }

    public function myJobs(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', $request->input('limit', 10));

        $query = Project::with(['bids' => function ($q) {
            $q->select(
                'id',
                'project_id',
                'user_id',
                'bid_amount',
                'freelancer_name',
                'freelancer_image',
                'date_time',
                'is_hired'
            );
        }])->where('user_id', auth()->id());

        if ($request->boolean('history')) {
            $query
                ->whereIn('status', ['in progress', 'completed'])
                ->whereHas('bids', function ($q) {
                    $q->where('is_hired', 1);
                });
        }

        $query->latest();
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $jobs = collect($paginator->items());
        $reviewedJobIds = Review::query()
            ->where('given_by', auth()->id())
            ->whereIn('job_id', $jobs->pluck('id'))
            ->pluck('job_id')
            ->map(fn ($jobId) => (int) $jobId)
            ->all();
        $reviewedLookup = array_flip($reviewedJobIds);

        $jobs->each(function (Project $job) use ($reviewedLookup) {
            $hasReviewed = isset($reviewedLookup[$job->id]);
            $job->setAttribute('has_reviewed', $hasReviewed);
            $job->setAttribute('can_review', $job->status === 'completed' && !$hasReviewed);
        });

        return $this->success([
            'jobs' => $jobs->values()->all(),
            'total_pages' => $paginator->lastPage(),
            'current_page' => $paginator->currentPage(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
        ],  'My jobs retrieved successfully.');
    }


    public function jobDetails(Request $request){
        if ($check = $this->checkClient()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'job_id' => 'required|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $job = Project::with('bids')
            ->withCount('is_hired')
            ->where('user_id', auth()->id())
            ->find($request->job_id);

        if (!$job) {
            return $this->error('Job not found.', 404);
        }

        $hasReviewed = Review::query()
            ->where('job_id', $job->id)
            ->where('given_by', auth()->id())
            ->exists();
        $job->setAttribute('has_reviewed', $hasReviewed);
        $job->setAttribute('can_review', $job->status === 'completed' && !$hasReviewed);

        return $this->success(['job' => $job], 'Job details retrieved successfully.');
    }

    public function hireNow(Request $request){
        if ($check = $this->checkClient()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'job_id' => 'required|exists:projects,id',
            'bid_id' => 'required|exists:bids,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $job = Project::where('user_id', auth()->id())
            ->find($request->job_id);
        if (!$job) {
            return $this->error('Job not found.', 404);
        }

        $bid = \App\Models\Bid::where('project_id', $job->id)->find($request->bid_id);
        if (!$bid) {
            return $this->error('Bid not found.', 404);
        }
        $user = User::find($bid->user_id);
        if (!$user) {
            return $this->error('Freelancer not found.', 404);
        }

        $result = DB::transaction(function () use ($job, $bid) {
            $lockedJob = Project::query()
                ->where('id', $job->id)
                ->where('user_id', auth()->id())
                ->lockForUpdate()
                ->first();
            $lockedBid = \App\Models\Bid::query()
                ->where('id', $bid->id)
                ->where('project_id', $job->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedJob || ! $lockedBid) {
                return ['error' => 'Job or bid not found.', 'code' => 404];
            }

            $hiredBid = \App\Models\Bid::query()
                ->where('project_id', $lockedJob->id)
                ->where('is_hired', 1)
                ->lockForUpdate()
                ->first();

            if ($hiredBid) {
                if ((int) $hiredBid->id === (int) $lockedBid->id) {
                    return ['already_hired' => true];
                }

                return [
                    'error' => 'Another provider has already been hired for this job.',
                    'code' => 409,
                ];
            }

            if ($lockedJob->status !== 'active') {
                return [
                    'error' => 'This job is no longer accepting hires.',
                    'code' => 409,
                ];
            }

            \App\Models\Bid::where('project_id', $lockedJob->id)->update(['is_hired' => 0]);
            $lockedBid->update(['is_hired' => 1]);
            $lockedJob->update(['status' => 'in progress']);

            return ['already_hired' => false];
        });

        if (isset($result['error'])) {
            return $this->error($result['error'], $result['code']);
        }

        $updatedJob = Project::with('bids')->find($job->id);
        $alreadyHired = (bool) $result['already_hired'];

        if (! $alreadyHired) {
            $providerId = (int) $user->id;
            $providerName = (string) $user->name;
            $providerEmail = (string) $user->email;
            $customerId = (int) $job->user_id;
            $jobId = (int) $job->id;
            $jobTitle = (string) $job->title;

            defer(function () use (
                $providerId,
                $providerName,
                $providerEmail,
                $customerId,
                $jobId,
                $jobTitle,
            ) {
                try {
                    Mail::html(
                        "Hi {$providerName}, <br/>Congratulations! You have been hired for the job: {$jobTitle}. <br/><br/>Best regards,<br/>The Team Bezzie",
                        function ($message) use ($providerEmail) {
                            $message->to($providerEmail)->subject('You have been hired!');
                        }
                    );
                } catch (Throwable $exception) {
                    report($exception);
                }

                foreach ([
                    [$providerId, 'You were hired', 'You have been hired for '.$jobTitle.'.'],
                    [$customerId, 'Job in progress', $jobTitle.' is now in progress.'],
                ] as [$recipientId, $title, $message]) {
                    try {
                        app(RealtimeNotifier::class)->notify(
                            $recipientId,
                            $title,
                            $message,
                            'job_in_progress',
                            'project',
                            $jobId,
                            ['status' => 'in progress'],
                        );
                    } catch (Throwable $exception) {
                        report($exception);
                    }
                }
            });
        }

        return $this->success([
            'job' => $updatedJob,
            'already_hired' => $alreadyHired,
            'hired_bid_id' => $bid->id,
        ], $alreadyHired ? 'This provider is already hired for this job.' : 'Freelancer hired successfully.');
    }

    public function jobMarkCompleted(Request $request){
        if ($check = $this->checkClient()) {
            return $check;
        }

        $validator = \Validator::make($request->all(), [
            'job_id' => 'required|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $job = Project::find($request->job_id);

        if (!$job) {
            return $this->error('Job not found.', 404);
        }
        if ($job->user_id != auth()->id()) {
            return $this->error('You are not authorized to mark this job as completed.', 400);
        }

        if ($job->status === 'completed') {
            return $this->success([], 'Job is already completed.');
        }

        if ($job->status != 'in progress') {
            return $this->error('Only jobs that are in progress can be marked as completed.', 400);
        }

        $paymentSucceeded = Payment::query()
            ->where('project_id', $job->id)
            ->where('customer_id', auth()->id())
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->exists();

        if (! $paymentSucceeded) {
            return $this->error('Complete the card payment before marking this job as completed.', 422);
        }

        $job->status = 'completed';
        $job->save();
        $hiredBid = $job->hiredBid()->first();

        $freelancer = $hiredBid ? User::find($hiredBid->user_id) : null;

        $client = User::find($job->user_id);
        // Mail to freelancer

        if ($freelancer) {

            Mail::html(

                "Hi,<br><br>

                The job <strong>{$job->title}</strong> has been marked as <strong>completed</strong> by the client.<br><br>

                Thank you for your work.<br><br>

                Best regards,<br>

                Team Bezzie",

                function ($message) use ($freelancer) {

                    $message->to($freelancer->email)

                            ->subject('Job Completed by Client');

                }

            );

        }

        // Mail to client

        if ($client) {

            Mail::html(

                "Hi,<br><br>

                Your job <strong>{$job->title}</strong> has been marked as <strong>completed</strong> successfully.<br><br>

                Thank you for using our platform.<br><br>

                Best regards,<br>

                Team Bezzie",

                function ($message) use ($client) {

                    $message->to($client->email)

                            ->subject('Job Completed Successfully');

                }

            );

        }

        if ($freelancer) {
            app(RealtimeNotifier::class)->notify(
                $freelancer->id,
                'Job completed',
                $job->title.' has been marked as completed.',
                'job_completed',
                'project',
                $job->id,
                ['status' => 'completed'],
            );
        }

        app(RealtimeNotifier::class)->notify(
            $job->user_id,
            'Job completed',
            $job->title.' has been marked as completed.',
            'job_completed',
            'project',
            $job->id,
            ['status' => 'completed'],
        );

        return $this->success([], 'Job marked as completed successfully.');
    }


}

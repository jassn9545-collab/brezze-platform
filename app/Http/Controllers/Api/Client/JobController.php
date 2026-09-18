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
use Illuminate\Support\Str;

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
        $perPage = (int) $request->input('per_page', 10);

        $query = Project::with(['bids' => function ($q) {
    $q->select(
        'id',
        'project_id',
        'user_id',
        'freelancer_name',
        'freelancer_image',
        'date_time',
        'is_hired'
    );
}])->where('user_id', auth()->id())->latest();
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        

        return $this->success([
            'jobs' => $paginator->items(),
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

        $job = Project::with('bids')->withCount('is_hired')->find($request->job_id);

        if (!$job) {
            return $this->error('Job not found.', 404);
        }

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

        $job = Project::find($request->job_id);
        if (!$job) {
            return $this->error('Job not found.', 404);
        }

        $bid = \App\Models\Bid::find($request->bid_id);
        if (!$bid) {
            return $this->error('Bid not found.', 404);
        }
        $user = User::find($bid->user_id);
        if (!$user) {
            return $this->error('Freelancer not found.', 404);
        }

        // Mark all other bids as not hired
        \App\Models\Bid::where('project_id', $job->id)->update(['is_hired' => 0]);

        // Mark the selected bid as hired
        $bid->is_hired = 1;
        $bid->save();

        $job->status = 'in progress';
        $job->save();
        

        Mail::html("Hi {$user->freelancer_name}, <br/>Congratulations! You have been hired for the job: {$job->title}. <br/><br/>Best regards,<br/>The Team Bezzie", function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('You have been hired!');
        });

        return $this->success(['job' => $job], 'Freelancer hired successfully.');
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

        if ($job->status != 'in progress') {
            return $this->error('Only jobs that are in progress can be marked as completed.', 400);
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

        return $this->success([], 'Job marked as completed successfully.');
    }


}

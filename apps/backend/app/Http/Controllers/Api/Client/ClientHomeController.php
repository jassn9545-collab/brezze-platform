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
use App\Models\Review;
use App\Models\Payment;
use Illuminate\Support\Str;
use DB;

class ClientHomeController extends BaseClientController
{
    use ApiResponse;

    public function freelancerProfile(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }
        // return $request->all();
        $validator = \Validator::make($request->all(), [
            'id'       => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $profile = User::find($request->id);

        if (!$profile) {
            return $this->error('Freelancer not found.', 404);
        }

        if ($profile->user_type !== 'freelancer') {
            return $this->error('Freelancer not found.', 404);
        }

        $profile->user_proof = UserProof::where('user_id', $profile->id)->first();
        $profile->job_success_score = 100;
        $profile->total_jobs = DB::table('bids')
            ->join('projects', 'projects.id', '=', 'bids.project_id')
            ->where('bids.user_id', $profile->id)
            ->where('bids.is_hired', 1)
            ->where('projects.status', 'completed')
            ->count();
        $profile->total_earnings = number_format((float) Payment::query()
            ->where('provider_id', $profile->id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings'), 2, '.', '');
        $reviewSummary = Review::receivedSummary($profile->id, 'freelancer');
        $profile->avg_rating = $reviewSummary['avg_rating'];
        $profile->review_count = $reviewSummary['review_count'];
        $profile->reviews = $reviewSummary['reviews'];
        $profile->is_top_rated = $profile->review_count > 0
            && $profile->avg_rating >= 4.5;
        $categoryIds = $profile->skills ? explode(',', $profile->skills) : [];

        $profile->categories = \App\Models\Category::whereIn('id', $categoryIds)
        ->pluck('name');

        return $this->success(['profile' => $profile], 'Freelancer profile retrieved successfully.');
    }

    public function myProfile(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }
        $profile = $request->user();
        $proofs = UserProof::where('user_id', $profile->id)->first();
        $profile->is_verified = $proofs?->is_verified ?? 0;
        $reviewSummary = Review::receivedSummary($profile->id, 'client');
        $profile->avg_rating = $reviewSummary['avg_rating'];
        $profile->review_count = $reviewSummary['review_count'];
        $profile->total_jobs = DB::table('projects')
            ->where('user_id', $profile->id)
            ->count();
        $profile->last3_jobs = Project::select('id','title','created_at','status')->withCount('bids')->where('user_id', $profile->id)->orderBy('created_at', 'desc')->take(3)->get();
        $profile->reviews = $reviewSummary['reviews'];
        return $this->success(['profile' => $profile], 'Client profile retrieved successfully.');
    }

    public function updateProfile(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }
        $validator = \Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $request->user()->id,
            'phone'      => 'required|string|max:20|unique:users,phone,' . $request->user()->id,
            'address'    => 'nullable|string|max:255',
            'state'       => 'nullable|string|max:100',
            'pincode'    => 'nullable|string|max:20',
            'dob'        => 'nullable|date',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = $request->user();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->street_address = $request->address;
        $user->state = $request->state;
        $user->dob = $request->dob;
        $user->pincode = $request->pincode;
        if($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('uploads/user'), $imageName);
            $user->profile_image = 'uploads/user/' . $imageName;
        }
        $user->save();
        $proofs = UserProof::where('user_id', $user->id)->first();
        $reviewSummary = Review::receivedSummary($user->id, 'client');
        $user->avg_rating = $reviewSummary['avg_rating'];
        $user->review_count = $reviewSummary['review_count'];
        $user->total_jobs = DB::table('projects')
            ->where('user_id', $user->id)
            ->count();
        $user->last3_jobs = Project::select('id','title','created_at','status')->withCount('bids')->where('user_id', $user->id)->orderBy('created_at', 'desc')->take(3)->get();
        $user->reviews = $reviewSummary['reviews'];

        return $this->success(['profile' => $user], 'Profile updated successfully.');
     }


}

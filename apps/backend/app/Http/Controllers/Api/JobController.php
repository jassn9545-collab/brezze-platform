<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserProof;
use Illuminate\Support\Facades\Hash;
use Mail;
use Illuminate\Support\Facades\Cache;
use App\Traits\ApiResponse;

class JobController extends Controller
{
    use ApiResponse;

    public function createJob(Request $request)
    {
        

        return $this->success(['user_id' => $user->id], 'Registration successful. OTP sent to your email.');
    }


}

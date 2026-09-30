<?php

namespace App\Http\Controllers\Api\Freelancer;

use App\Http\Controllers\Controller;

class BaseFreelancerController extends Controller
{
    protected function checkFreelancer()
    {
        if (!auth()->check()) {
            return $this->error('Unauthenticated', 401);
        }

        if (auth()->user()->user_type !== 'freelancer') {
            return $this->error('Only freelancers can access this', 403);
        }

        return null;
    }
}
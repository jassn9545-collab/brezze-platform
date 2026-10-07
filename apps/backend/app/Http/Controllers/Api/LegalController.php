<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class LegalController extends Controller
{
    use ApiResponse;

    public function privacyPolicy()
    {
        return $this->success(config('legal.privacy'), 'Privacy policy fetched successfully.');
    }
}

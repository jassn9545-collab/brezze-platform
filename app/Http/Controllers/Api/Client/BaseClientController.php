<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;

class BaseClientController extends Controller
{
    protected function checkClient()
    {
        if (!auth()->check()) {
            return $this->error('Unauthenticated', 401);
        }

        if (auth()->user()->user_type !== 'client') {
            return $this->error('Only clients can access this', 403);
        }

        return null;
    }
}
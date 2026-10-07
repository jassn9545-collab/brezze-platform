<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'country_code' => ['nullable', 'string', 'max:8'],
            'phone' => ['nullable', 'string', 'max:24'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422, $validator->errors());
        }

        $supportRequest = SupportRequest::create([
            ...$validator->validated(),
            'user_id' => $request->user()->id,
            'status' => 'open',
        ]);

        return $this->success([
            'id' => $supportRequest->id,
            'status' => $supportRequest->status,
            'created_at' => $supportRequest->created_at?->toISOString(),
        ], 'Your support request has been submitted.', 201);
    }
}

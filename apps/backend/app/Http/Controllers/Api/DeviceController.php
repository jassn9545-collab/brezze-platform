<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeviceController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string|max:512',
            'platform' => 'required|in:android,ios',
            'app_type' => 'required|in:customer,provider',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $device = UserDevice::query()->updateOrCreate(
            ['token' => $request->string('token')->toString()],
            [
                'user_id' => $request->user()->id,
                'platform' => $request->string('platform')->toString(),
                'app_type' => $request->string('app_type')->toString(),
                'enabled' => true,
                'last_seen_at' => now(),
            ]
        );

        return $this->success(['device_id' => $device->id], 'Notification device registered.');
    }

    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), ['token' => 'required|string|max:512']);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        UserDevice::query()
            ->where('user_id', $request->user()->id)
            ->where('token', $request->string('token')->toString())
            ->update(['enabled' => false]);

        return $this->success([], 'Notification device removed.');
    }
}

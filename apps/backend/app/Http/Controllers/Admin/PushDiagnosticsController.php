<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use App\Services\FirebasePushService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class PushDiagnosticsController extends Controller
{
    public function index(FirebasePushService $firebase)
    {
        $hasDevices = Schema::hasTable('user_devices');

        return view('admin.push-diagnostics', [
            'diagnostics' => $firebase->diagnostics(),
            'hasDevices' => $hasDevices,
            // Never display device tokens or service-account credentials.
            'devices' => $hasDevices ? UserDevice::query()
                ->select('id', 'user_id', 'platform', 'app_type', 'enabled', 'last_seen_at')
                ->with('user:id,name')->latest('last_seen_at')->paginate(25) : null,
        ]);
    }

    public function sendTest(Request $request, FirebasePushService $firebase)
    {
        $validated = $request->validate(['user_id' => 'required|integer|exists:users,id']);
        $result = $firebase->sendToUser(
            (int) $validated['user_id'],
            'Bezzie notification test',
            'Push notifications are connected.',
            ['type' => 'test']
        );

        return redirect()->route('admin.push-diagnostics')->with('push_result', $result);
    }
}

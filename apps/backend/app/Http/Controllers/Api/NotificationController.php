<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $notifications = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return $this->success([
            'notifications' => collect($notifications->items())
                ->map(fn (UserNotification $notification) => $this->format($notification))
                ->values(),
            'unread_count' => UserNotification::query()
                ->where('user_id', $request->user()->id)
                ->whereNull('read_at')
                ->count(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ],
        ], 'Notifications fetched successfully.');
    }

    public function markRead(Request $request, UserNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        if ($notification->read_at === null) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        return $this->success($this->format($notification->fresh()), 'Notification marked as read.');
    }

    public function markAllRead(Request $request)
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return $this->success([], 'All notifications marked as read.');
    }

    private function format(UserNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'action_type' => $notification->action_type,
            'action_id' => $notification->action_id,
            'is_read' => $notification->read_at !== null,
            'created_at' => $notification->created_at?->toISOString(),
        ];
    }
}

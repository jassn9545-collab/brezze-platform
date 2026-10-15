<?php

namespace App\Services;

use App\Events\UserRealtimeEvent;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Schema;
use Throwable;

class RealtimeNotifier
{
    public function __construct(private FirebasePushService $firebase)
    {
    }

    public function notify(
        int $userId,
        string $title,
        string $message,
        string $type,
        ?string $actionType = null,
        ?int $actionId = null,
        array $data = [],
        ?string $pushMessage = null,
    ): ?UserNotification {
        $notification = null;
        if (Schema::hasTable('user_notifications')) {
            $notification = UserNotification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'action_type' => $actionType,
                'action_id' => $actionId,
            ]);
        }

        try {
            UserRealtimeEvent::dispatch($userId, $type, [
                'notification' => $notification ? [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'action_type' => $notification->action_type,
                    'action_id' => $notification->action_id,
                    'is_read' => false,
                    'created_at' => $notification->created_at?->toISOString(),
                ] : null,
                ...$data,
            ]);
        } catch (Throwable $exception) {
            report($exception);
        }

        $this->firebase->sendToUser($userId, $title, $pushMessage ?? $message, [
            ...$data,
            'type' => $type,
            'action_type' => $actionType ?? '',
            'action_id' => $actionId ?? '',
        ]);

        return $notification;
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRealtimeEvent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $userId, public string $kind, public array $payload)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.'.$this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'user.event';
    }

    public function broadcastWith(): array
    {
        return ['kind' => $this->kind, ...$this->payload];
    }
}

<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public ChatMessage $message, public int $recipientId)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.'.$this->message->conversation_id),
            new PrivateChannel('user.'.$this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_id' => $this->message->sender_id,
                'body' => $this->message->body,
                'read_at' => $this->message->read_at?->toISOString(),
                'created_at' => $this->message->created_at?->toISOString(),
            ],
            'recipient_id' => $this->recipientId,
        ];
    }
}

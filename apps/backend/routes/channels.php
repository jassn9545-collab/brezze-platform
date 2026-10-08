<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatConversation;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    return ChatConversation::query()
        ->whereKey($conversationId)
        ->where(function ($query) use ($user) {
            $query->where('client_id', $user->id)
                ->orWhere('provider_id', $user->id);
        })
        ->exists();
});

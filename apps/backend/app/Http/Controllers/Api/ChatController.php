<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\Project;
use App\Models\ServiceBooking;
use App\Models\User;
use App\Events\ChatMessageSent;
use App\Services\RealtimeNotifier;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Throwable;

class ChatController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$this->canChat($user)) {
            return $this->error('Only clients and freelancers can use chat.', 403);
        }

        $conversations = ChatConversation::query()
            ->where(function ($query) use ($user) {
                $query->where('client_id', $user->id)
                    ->orWhere('provider_id', $user->id);
            })
            ->with([
                'client:id,name,profile_image',
                'provider:id,name,profile_image',
                'project:id,title',
                'latestMessage',
            ])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('sender_id', '!=', $user->id)
                    ->whereNull('read_at');
            }])
            ->orderByRaw('COALESCE(last_message_at, created_at) DESC')
            ->get()
            ->map(fn (ChatConversation $conversation) => $this->conversationData($conversation, $user, $request));

        return $this->success(['conversations' => $conversations], 'Conversations retrieved successfully.');
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$this->canChat($user)) {
            return $this->error('Only clients and freelancers can use chat.', 403);
        }

        $validator = Validator::make($request->all(), [
            'recipient_id' => 'nullable|integer|exists:users,id',
            'project_id' => 'nullable|integer|exists:projects,id',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $recipientId = $request->input('recipient_id');
        $projectId = $request->input('project_id');
        if (!$recipientId && !$projectId) {
            return $this->error('A recipient or project is required.', 422);
        }

        $project = $projectId ? Project::find($projectId) : null;
        if ($project) {
            if ($user->user_type === 'client') {
                if ((int) $project->user_id !== (int) $user->id) {
                    return $this->error('Project not found.', 404);
                }

                $providerId = $recipientId ?: Bid::query()
                    ->where('project_id', $project->id)
                    ->where('is_hired', 1)
                    ->value('user_id');

                if (!$providerId) {
                    return $this->error('Select a provider for this project.', 422);
                }

                $provider = User::find($providerId);
                if (!$provider || $provider->user_type !== 'freelancer') {
                    return $this->error('Provider not found.', 422);
                }

                if (!Bid::query()->where('project_id', $project->id)
                    ->where('user_id', $provider->id)->exists()) {
                    return $this->error('This provider has not applied to the project.', 403);
                }

                $clientId = $user->id;
                $providerId = $provider->id;
            } else {
                if (!Bid::query()->where('project_id', $project->id)
                    ->where('user_id', $user->id)->exists()) {
                    return $this->error('You cannot chat about this project.', 403);
                }

                if ($recipientId && (int) $recipientId !== (int) $project->user_id) {
                    return $this->error('Recipient does not match this project.', 403);
                }

                $client = User::find($project->user_id);
                if (!$client || $client->user_type !== 'client') {
                    return $this->error('Client not found.', 422);
                }

                $clientId = $client->id;
                $providerId = $user->id;
            }
        } else {
            $recipient = User::find($recipientId);
            if (!$recipient || !$this->canChat($recipient)
                || $recipient->user_type === $user->user_type) {
                return $this->error('Choose a client or provider to chat with.', 422);
            }

            $clientId = $user->user_type === 'client' ? $user->id : $recipient->id;
            $providerId = $user->user_type === 'freelancer' ? $user->id : $recipient->id;

            $acceptedBooking = ServiceBooking::query()
                ->where('client_id', $clientId)
                ->where('provider_id', $providerId)
                ->where('status', 'accepted')
                ->whereNotNull('conversation_id')
                ->latest('responded_at')
                ->first();
            if (!$acceptedBooking) {
                return $this->error(
                    'Chat becomes available after a service request is accepted or a freelancer is hired.',
                    403
                );
            }

            $bookingConversation = ChatConversation::query()->find($acceptedBooking->conversation_id);
            if ($bookingConversation) {
                $bookingConversation->load([
                    'client:id,name,profile_image',
                    'provider:id,name,profile_image',
                    'project:id,title',
                    'latestMessage',
                ]);
                $bookingConversation->unread_count = 0;

                return $this->success(
                    ['conversation' => $this->conversationData($bookingConversation, $user, $request)],
                    'Conversation ready.'
                );
            }
        }

        $key = $project
            ? "project:{$project->id}:{$clientId}:{$providerId}"
            : "direct:{$clientId}:{$providerId}";

        $conversation = ChatConversation::query()->firstOrCreate(
            ['conversation_key' => $key],
            [
                'project_id' => $project?->id,
                'client_id' => $clientId,
                'provider_id' => $providerId,
            ]
        );

        $conversation->load([
            'client:id,name,profile_image',
            'provider:id,name,profile_image',
            'project:id,title',
            'latestMessage',
        ]);
        $conversation->unread_count = 0;

        return $this->success(
            ['conversation' => $this->conversationData($conversation, $user, $request)],
            'Conversation ready.'
        );
    }

    public function messages(Request $request, ChatConversation $conversation)
    {
        if (!$this->isParticipant($conversation, $request->user())) {
            return $this->error('Conversation not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'after_id' => 'nullable|integer|min:1',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $query = $conversation->messages()->orderBy('id');
        if ($request->filled('after_id')) {
            $query->where('id', '>', (int) $request->input('after_id'));
        }

        $messages = $query->get()
            ->map(fn (ChatMessage $message) => $this->messageData($message));

        $conversation->load([
            'client:id,name,profile_image',
            'provider:id,name,profile_image',
            'project:id,title',
            'latestMessage',
        ]);
        $conversation->unread_count = 0;

        return $this->success([
            'conversation' => $this->conversationData($conversation, $request->user(), $request),
            'messages' => $messages,
        ], 'Messages retrieved successfully.');
    }

    public function send(Request $request, ChatConversation $conversation)
    {
        if (!$this->isParticipant($conversation, $request->user())) {
            return $this->error('Conversation not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'body' => 'required|string|max:5000',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $body = trim((string) $request->input('body'));
        if ($body === '') {
            return $this->error('Message cannot be empty.', 422);
        }

        $message = DB::transaction(function () use ($conversation, $request, $body) {
            $message = $conversation->messages()->create([
                'sender_id' => $request->user()->id,
                'body' => $body,
            ]);
            $conversation->update(['last_message_at' => $message->created_at]);

            return $message;
        });

        $recipientId = (int) $conversation->client_id === (int) $request->user()->id
            ? (int) $conversation->provider_id
            : (int) $conversation->client_id;

        try {
            ChatMessageSent::dispatch($message, $recipientId);
        } catch (Throwable $exception) {
            report($exception);
        }
        app(RealtimeNotifier::class)->notify(
            $recipientId,
            $request->user()->name ?: 'New message',
            mb_strimwidth($body, 0, 140, '…'),
            'chat_message',
            'conversation',
            $conversation->id,
            ['conversation_id' => $conversation->id],
            'You have a new message.',
        );

        return $this->success(['message' => $this->messageData($message)], 'Message sent.', 201);
    }

    private function canChat(?User $user): bool
    {
        return $user && in_array($user->user_type, ['client', 'freelancer'], true);
    }

    private function isParticipant(ChatConversation $conversation, ?User $user): bool
    {
        return $user && (
            (int) $conversation->client_id === (int) $user->id
            || (int) $conversation->provider_id === (int) $user->id
        );
    }

    private function conversationData(ChatConversation $conversation, User $user, Request $request): array
    {
        $other = (int) $conversation->client_id === (int) $user->id
            ? $conversation->provider
            : $conversation->client;
        $profileImage = $other?->profile_image;
        if ($profileImage && !filter_var($profileImage, FILTER_VALIDATE_URL)) {
            $profileImage = $request->root().'/'
                .ltrim(preg_replace('#^/?public/#', '', $profileImage), '/');
        }

        $latest = $conversation->latestMessage;

        return [
            'id' => $conversation->id,
            'project_id' => $conversation->project_id,
            'project_title' => $conversation->project?->title,
            'other_user' => [
                'id' => $other?->id,
                'name' => $other?->name,
                'profile_image' => $profileImage,
            ],
            'latest_message' => $latest ? [
                'id' => $latest->id,
                'body' => $latest->body,
                'sender_id' => $latest->sender_id,
                'created_at' => $latest->created_at?->toISOString(),
            ] : null,
            'unread_count' => (int) ($conversation->unread_count ?? 0),
            'created_at' => $conversation->created_at?->toISOString(),
            'updated_at' => $conversation->updated_at?->toISOString(),
        ];
    }

    private function messageData(ChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'body' => $message->body,
            'read_at' => $message->read_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
        ];
    }
}

<?php

use App\Models\Bid;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('user_type');
        $table->string('profile_image')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('title');
        $table->string('status')->nullable();
    });

    Schema::create('bids', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->unsignedBigInteger('user_id');
        $table->boolean('is_hired')->default(false);
    });

    $this->chatMigration = require database_path('migrations/2026_10_01_000001_create_chat_tables.php');
    $this->chatMigration->up();

    $this->client = User::create([
        'name' => 'Client',
        'email' => 'client@chat.test',
        'password' => 'password',
        'user_type' => 'client',
    ]);
    $this->provider = User::create([
        'name' => 'Provider',
        'email' => 'provider@chat.test',
        'password' => 'password',
        'user_type' => 'freelancer',
    ]);
    $this->project = Project::create([
        'title' => 'Electrical repair',
        'user_id' => $this->client->id,
        'status' => 'active',
    ]);
    Bid::create([
        'project_id' => $this->project->id,
        'user_id' => $this->provider->id,
        'is_hired' => true,
    ]);
});

afterEach(function () {
    $this->chatMigration->down();
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('users');
});

it('lets both participants exchange messages and tracks unread status', function () {
    Sanctum::actingAs($this->client);

    $created = $this->postJson('/api/chat/conversations', [
        'project_id' => $this->project->id,
        'recipient_id' => $this->provider->id,
    ])->assertOk()
        ->assertJsonPath('data.conversation.other_user.name', 'Provider')
        ->assertJsonPath('data.conversation.project_title', 'Electrical repair');

    $conversationId = $created->json('data.conversation.id');

    $this->postJson('/api/chat/conversations', [
        'project_id' => $this->project->id,
        'recipient_id' => $this->provider->id,
    ])->assertJsonPath('data.conversation.id', $conversationId);

    Sanctum::actingAs($this->provider);

    $this->getJson('/api/chat/conversations')
        ->assertOk()
        ->assertJsonCount(1, 'data.conversations')
        ->assertJsonPath('data.conversations.0.other_user.name', 'Client');

    $this->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'body' => '  Hello, I can help.  ',
    ])->assertCreated()
        ->assertJsonPath('data.message.body', 'Hello, I can help.');

    Sanctum::actingAs($this->client);

    $this->getJson('/api/chat/conversations')
        ->assertJsonPath('data.conversations.0.unread_count', 1)
        ->assertJsonPath('data.conversations.0.latest_message.body', 'Hello, I can help.');

    $received = $this->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk()
        ->assertJsonCount(1, 'data.messages')
        ->assertJsonPath('data.messages.0.sender_id', $this->provider->id);

    expect($received->json('data.messages.0.read_at'))->not->toBeNull();

    $this->getJson('/api/chat/conversations')
        ->assertJsonPath('data.conversations.0.unread_count', 0);

    $this->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'body' => 'Thanks, when are you available?',
    ])->assertCreated();

    Sanctum::actingAs($this->provider);
    $this->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertJsonCount(2, 'data.messages')
        ->assertJsonPath('data.messages.1.body', 'Thanks, when are you available?');
});

it('allows a direct client-provider conversation without a project', function () {
    Sanctum::actingAs($this->client);

    $this->postJson('/api/chat/conversations', [
        'recipient_id' => $this->provider->id,
    ])->assertOk()
        ->assertJsonPath('data.conversation.project_id', null)
        ->assertJsonPath('data.conversation.other_user.name', 'Provider');

    $this->postJson('/api/chat/conversations', [
        'recipient_id' => $this->client->id,
    ])->assertUnprocessable();

    Sanctum::actingAs($this->provider);

    $this->postJson('/api/chat/conversations', [
        'project_id' => $this->project->id,
    ])->assertOk()
        ->assertJsonPath('data.conversation.other_user.name', 'Client');
});

it('blocks outsiders and rejects empty messages', function () {
    Sanctum::actingAs($this->client);
    $conversationId = $this->postJson('/api/chat/conversations', [
        'project_id' => $this->project->id,
        'recipient_id' => $this->provider->id,
    ])->json('data.conversation.id');

    $this->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'body' => '   ',
    ])->assertUnprocessable();

    $otherClient = User::create([
        'name' => 'Other Client',
        'email' => 'other-client@chat.test',
        'password' => 'password',
        'user_type' => 'client',
    ]);
    Sanctum::actingAs($otherClient);

    $this->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertNotFound();
    $this->postJson("/api/chat/conversations/{$conversationId}/messages", [
        'body' => 'Unauthorized',
    ])->assertNotFound();
    $this->postJson('/api/chat/conversations', [
        'project_id' => $this->project->id,
        'recipient_id' => $this->provider->id,
    ])->assertNotFound();

    $otherProvider = User::create([
        'name' => 'Other Provider',
        'email' => 'other-provider@chat.test',
        'password' => 'password',
        'user_type' => 'freelancer',
    ]);
    Sanctum::actingAs($otherProvider);
    $this->postJson('/api/chat/conversations', [
        'project_id' => $this->project->id,
    ])->assertForbidden();
});

it('returns usable profile photo URLs for both message lists', function () {
    $this->provider->update(['profile_image' => 'uploads/user/provider.jpg']);
    $this->client->update(['profile_image' => 'public/uploads/user/client.jpg']);

    Sanctum::actingAs($this->client);
    $response = $this->postJson('/api/chat/conversations', [
        'recipient_id' => $this->provider->id,
    ])->assertOk();
    $conversationId = $response->json('data.conversation.id');
    expect(parse_url($response->json('data.conversation.other_user.profile_image'), PHP_URL_PATH))
        ->toBe('/uploads/user/provider.jpg');

    Sanctum::actingAs($this->provider);
    $response = $this->getJson('/api/chat/conversations')->assertOk();
    expect(parse_url($response->json('data.conversations.0.other_user.profile_image'), PHP_URL_PATH))
        ->toBe('/uploads/user/client.jpg');

    $this->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertJsonPath('data.conversation.other_user.id', $this->client->id);
});

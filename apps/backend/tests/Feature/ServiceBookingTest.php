<?php

use App\Models\ServiceBooking;
use App\Models\ServiceCatalog;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
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
    Schema::create('service_catalogs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id')->index();
        $table->unsignedBigInteger('category_id')->nullable();
        $table->string('heading');
        $table->text('description');
        $table->decimal('price', 12, 2);
        $table->json('images');
        $table->boolean('status')->default(true);
        $table->timestamps();
    });
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('title')->nullable();
        $table->string('slug')->nullable();
        $table->string('category')->nullable();
        $table->text('description')->nullable();
        $table->string('budget')->nullable();
        $table->string('status')->default('active');
        $table->unsignedBigInteger('user_id')->nullable();
        $table->timestamps();
    });
    Schema::create('bids', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->unsignedBigInteger('project_id')->nullable();
        $table->string('bid_amount')->nullable();
        $table->string('freelancer_name')->nullable();
        $table->string('freelancer_image')->nullable();
        $table->string('attachment')->nullable();
        $table->dateTime('date_time')->nullable();
        $table->boolean('is_hired')->default(false);
        $table->string('work_attachment')->nullable();
        $table->text('work_description')->nullable();
        $table->dateTime('end_date_time')->nullable();
        $table->timestamps();
    });
    Schema::create('chat_conversations', function (Blueprint $table) {
        $table->id();
        $table->string('conversation_key')->unique();
        $table->unsignedBigInteger('project_id')->nullable();
        $table->unsignedBigInteger('client_id');
        $table->unsignedBigInteger('provider_id');
        $table->timestamp('last_message_at')->nullable();
        $table->timestamps();
    });
    Schema::create('chat_messages', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('conversation_id');
        $table->unsignedBigInteger('sender_id');
        $table->text('body');
        $table->timestamp('read_at')->nullable();
        $table->timestamps();
    });
    Schema::create('service_bookings', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('service_catalog_id');
        $table->unsignedBigInteger('client_id');
        $table->unsignedBigInteger('provider_id');
        $table->text('note')->nullable();
        $table->decimal('price', 12, 2);
        $table->string('status')->default('pending');
        $table->unsignedBigInteger('project_id')->nullable();
        $table->unsignedBigInteger('conversation_id')->nullable();
        $table->timestamp('responded_at')->nullable();
        $table->timestamps();
    });

    $this->client = User::create([
        'name' => 'Booking Client',
        'email' => 'booking-client@test.local',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider = User::create([
        'name' => 'Booking Provider',
        'email' => 'booking-provider@test.local',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);
    $this->catalog = ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'category_id' => 8,
        'heading' => 'Water tank cleaning',
        'description' => 'Clean and inspect the water tank.',
        'price' => '125.00',
        'images' => ['uploads/catalogs/tank.jpg'],
        'status' => true,
    ]);
});

afterEach(function () {
    Schema::dropIfExists('service_bookings');
    Schema::dropIfExists('chat_messages');
    Schema::dropIfExists('chat_conversations');
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('service_catalogs');
    Schema::dropIfExists('users');
});

it('creates one pending request and exposes it as a freelancer notification', function () {
    Sanctum::actingAs($this->client);

    $this->postJson('/api/client/service-bookings', [
        'catalog_id' => $this->catalog->id,
        'note' => 'Please arrive after 10am.',
    ])->assertCreated()
        ->assertJsonPath('data.booking.service_title', 'Water tank cleaning')
        ->assertJsonPath('data.booking.price', '125.00')
        ->assertJsonPath('data.booking.note', 'Please arrive after 10am.')
        ->assertJsonPath('data.booking.status', 'pending');

    $this->postJson('/api/client/service-bookings', [
        'catalog_id' => $this->catalog->id,
    ])->assertConflict();

    Sanctum::actingAs($this->provider);
    $this->getJson('/api/freelancer/service-bookings')
        ->assertOk()
        ->assertJsonPath('data.pending_count', 1)
        ->assertJsonCount(1, 'data.bookings')
        ->assertJsonPath('data.bookings.0.client.name', 'Booking Client');
});

it('starts a hired job and enables chat when the freelancer accepts', function () {
    Sanctum::actingAs($this->client);
    $bookingId = $this->postJson('/api/client/service-bookings', [
        'catalog_id' => $this->catalog->id,
        'note' => 'Use the side entrance.',
    ])->assertCreated()->json('data.booking.id');

    $this->postJson('/api/chat/conversations', [
        'recipient_id' => $this->provider->id,
    ])->assertForbidden();

    Sanctum::actingAs($this->provider);
    $response = $this->postJson("/api/freelancer/service-bookings/{$bookingId}/respond", [
        'action' => 'accept',
    ])->assertOk()
        ->assertJsonPath('data.booking.status', 'accepted');

    $projectId = $response->json('data.booking.project_id');
    $conversationId = $response->json('data.booking.conversation_id');

    expect($projectId)->not->toBeNull()
        ->and($conversationId)->not->toBeNull();
    $this->assertDatabaseHas('projects', [
        'id' => $projectId,
        'status' => 'in progress',
        'user_id' => $this->client->id,
    ]);
    $this->assertDatabaseHas('bids', [
        'project_id' => $projectId,
        'user_id' => $this->provider->id,
        'is_hired' => 1,
    ]);

    Sanctum::actingAs($this->client);
    $this->getJson("/api/chat/conversations/{$conversationId}/messages")
        ->assertOk()
        ->assertJsonPath('data.conversation.project_id', $projectId);
    $this->postJson('/api/chat/conversations', [
        'recipient_id' => $this->provider->id,
    ])->assertOk()
        ->assertJsonPath('data.conversation.id', $conversationId);
    $this->getJson('/api/client/service-bookings?catalog_id='.$this->catalog->id)
        ->assertOk()
        ->assertJsonPath('data.bookings.0.status', 'accepted')
        ->assertJsonPath('data.bookings.0.conversation_id', $conversationId);
});

it('rejects a request without creating a job or chat', function () {
    Sanctum::actingAs($this->client);
    $bookingId = $this->postJson('/api/client/service-bookings', [
        'catalog_id' => $this->catalog->id,
    ])->assertCreated()->json('data.booking.id');

    Sanctum::actingAs($this->provider);
    $this->postJson("/api/freelancer/service-bookings/{$bookingId}/respond", [
        'action' => 'reject',
    ])->assertOk()
        ->assertJsonPath('data.booking.status', 'rejected')
        ->assertJsonPath('data.booking.project_id', null)
        ->assertJsonPath('data.booking.conversation_id', null);

    expect(ServiceBooking::find($bookingId)->status)->toBe('rejected');
    $this->assertDatabaseCount('projects', 0);
    $this->assertDatabaseCount('chat_conversations', 0);
});

<?php

use App\Models\ServiceCatalog;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
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
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('service_catalogs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id')->index();
        $table->string('heading');
        $table->text('description');
        $table->decimal('price', 12, 2);
        $table->json('images');
        $table->boolean('status')->default(true)->index();
        $table->timestamps();
    });

    $this->provider = User::create([
        'name' => 'Provider',
        'email' => 'provider@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);
});

afterEach(function () {
    if (isset($this->uploadedCatalogPath)
        && str_starts_with($this->uploadedCatalogPath, 'uploads/catalogs/')) {
        @unlink(public_path($this->uploadedCatalogPath));
    }
    Schema::dropIfExists('service_catalogs');
    Schema::dropIfExists('users');
});

it('creates a catalog for the authenticated provider', function () {
    Sanctum::actingAs($this->provider);

    $response = $this->post('/api/freelancer/catalogs', [
        'heading' => 'Switchboard installation',
        'description' => 'Install and test a new switchboard.',
        'price' => '49.00',
        'images' => [UploadedFile::fake()->image('catalog.jpg')],
    ], ['Accept' => 'application/json']);

    $response->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.catalog.heading', 'Switchboard installation')
        ->assertJsonPath('data.catalog.price', '49.00');

    $this->uploadedCatalogPath = $response->json('data.catalog.images.0');

    expect(ServiceCatalog::query()->where('provider_id', $this->provider->id)->count())->toBe(1);
});

it('lists only the authenticated providers catalogs', function () {
    $otherProvider = User::create([
        'name' => 'Other Provider',
        'email' => 'other@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);

    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'heading' => 'My service',
        'description' => 'My catalog description',
        'price' => '20.00',
        'images' => ['uploads/catalogs/mine.jpg'],
    ]);
    ServiceCatalog::create([
        'provider_id' => $otherProvider->id,
        'heading' => 'Other service',
        'description' => 'Other catalog description',
        'price' => '30.00',
        'images' => ['uploads/catalogs/other.jpg'],
    ]);

    Sanctum::actingAs($this->provider);

    $this->getJson('/api/freelancer/catalogs')
        ->assertOk()
        ->assertJsonCount(1, 'data.catalogs')
        ->assertJsonPath('data.catalogs.0.heading', 'My service')
        ->assertJsonPath('data.catalogs.0.image_urls.0', 'http://localhost/public/uploads/catalogs/mine.jpg');
});

it('rejects catalog access for a customer account', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    Sanctum::actingAs($customer);

    $this->getJson('/api/freelancer/catalogs')->assertForbidden();
});

it('shows a client only the selected freelancer active catalogs, newest first', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer-list@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $otherProvider = User::create([
        'name' => 'Other Provider',
        'email' => 'other-list@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);

    $older = ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'heading' => 'Older service',
        'description' => 'Older description',
        'price' => '20.00',
        'images' => ['uploads/catalogs/older.jpg'],
        'status' => true,
    ]);
    $older->created_at = now()->subDay();
    $older->save();

    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'heading' => 'Newest service',
        'description' => 'Newest description',
        'price' => '40.00',
        'images' => ['uploads/catalogs/newest.jpg'],
        'status' => true,
    ]);
    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'heading' => 'Inactive service',
        'description' => 'Should remain hidden',
        'price' => '50.00',
        'images' => ['uploads/catalogs/inactive.jpg'],
        'status' => false,
    ]);
    ServiceCatalog::create([
        'provider_id' => $otherProvider->id,
        'heading' => 'Other provider service',
        'description' => 'Should remain hidden',
        'price' => '60.00',
        'images' => ['uploads/catalogs/other.jpg'],
        'status' => true,
    ]);

    Sanctum::actingAs($customer);

    $this->getJson("/api/client/freelancer-catalogs/{$this->provider->id}")
        ->assertOk()
        ->assertJsonPath('data.provider.id', $this->provider->id)
        ->assertJsonPath('data.provider.name', 'Provider')
        ->assertJsonCount(2, 'data.catalogs')
        ->assertJsonPath('data.catalogs.0.heading', 'Newest service')
        ->assertJsonPath('data.catalogs.0.price', '40.00')
        ->assertJsonPath('data.catalogs.0.image_urls.0', 'http://localhost/public/uploads/catalogs/newest.jpg')
        ->assertJsonPath('data.catalogs.1.heading', 'Older service');
});

it('limits freelancer catalog viewing to authenticated clients and valid freelancers', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer-access@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $providerUrl = "/api/client/freelancer-catalogs/{$this->provider->id}";

    $this->getJson($providerUrl)->assertUnauthorized();

    Sanctum::actingAs($this->provider);
    $this->getJson($providerUrl)->assertForbidden();

    Sanctum::actingAs($customer);
    $this->getJson("/api/client/freelancer-catalogs/{$customer->id}")->assertNotFound();
    $this->getJson('/api/client/freelancer-catalogs/999999')->assertNotFound();
});

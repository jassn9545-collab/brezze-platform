<?php

use App\Models\ServiceCatalog;
use App\Models\User;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
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
        $table->string('skills')->nullable();
        $table->string('profile_title')->nullable();
        $table->text('profile_description')->nullable();
        $table->string('profile_image')->nullable();
        $table->string('city')->nullable();
        $table->string('state')->nullable();
        $table->string('country')->nullable();
        $table->string('experience')->nullable();
        $table->boolean('is_verified')->default(false);
        $table->boolean('is_featured')->default(false);
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug');
        $table->string('photo');
    });

    Schema::create('reviews', function (Blueprint $table) {
        $table->id();
        $table->string('given_by')->nullable();
        $table->string('given_to')->nullable();
        $table->string('job_id')->nullable();
        $table->integer('star')->nullable();
        $table->text('review')->nullable();
        $table->string('review_to');
        $table->timestamps();
    });

    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('status')->nullable();
    });

    Schema::create('bids', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->unsignedBigInteger('user_id');
        $table->boolean('is_hired')->default(false);
    });

    Schema::create('service_catalogs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('provider_id')->index();
        $table->unsignedBigInteger('category_id')->nullable()->index();
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
    Schema::dropIfExists('bids');
    Schema::dropIfExists('projects');
    Schema::dropIfExists('reviews');
    Schema::dropIfExists('categories');
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

it('infers a new catalog category from a multi skilled providers service details', function () {
    Illuminate\Support\Facades\DB::table('categories')->insert([
        ['id' => 1, 'name' => 'Plumber', 'slug' => 'plumber', 'photo' => 'plumber.png'],
        ['id' => 2, 'name' => 'Electrician', 'slug' => 'electrician', 'photo' => 'electrician.png'],
    ]);
    $this->provider->update(['skills' => '1,2']);
    Sanctum::actingAs($this->provider);

    $response = $this->post('/api/freelancer/catalogs', [
        'heading' => 'Electrical switch repair',
        'description' => 'Replace and test a damaged switch.',
        'price' => '59.00',
        'images' => [UploadedFile::fake()->image('electrical.jpg')],
    ], ['Accept' => 'application/json']);

    $response->assertCreated()
        ->assertJsonPath('data.catalog.category_id', 2);

    $this->uploadedCatalogPath = $response->json('data.catalog.images.0');
    expect(ServiceCatalog::query()->latest('id')->value('category_id'))->toBe(2);
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
        ->assertJsonPath('data.catalogs.0.image_urls.0', 'http://localhost/uploads/catalogs/mine.jpg');
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
        ->assertJsonPath('data.catalogs.0.image_urls.0', 'http://localhost/uploads/catalogs/newest.jpg')
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

it('returns dynamic categories freelancers and active services for clients', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer-discovery@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider->update([
        'skills' => '1',
        'profile_title' => 'Master Plumber',
        'profile_image' => 'uploads/user/provider.jpg',
        'is_verified' => true,
        'is_featured' => true,
    ]);

    Illuminate\Support\Facades\DB::table('categories')->insert([
        'id' => 1,
        'name' => 'Plumber',
        'slug' => 'plumber',
        'photo' => 'plumber.png',
    ]);
    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'heading' => 'Tap repair',
        'description' => 'Repair a leaking tap.',
        'price' => '45.00',
        'images' => ['uploads/catalogs/tap.jpg'],
        'status' => true,
    ]);

    Sanctum::actingAs($customer);

    $this->getJson('/api/client/discovery')
        ->assertOk()
        ->assertJsonPath('data.categories.0.name', 'Plumber')
        ->assertJsonPath('data.categories.0.image_url', 'http://localhost/uploads/category/plumber.png')
        ->assertJsonPath('data.professionals.0.id', $this->provider->id)
        ->assertJsonPath('data.professionals.0.profile_title', 'Master Plumber')
        ->assertJsonPath('data.professionals.0.is_featured', true)
        ->assertJsonPath('data.featured_professionals.0.id', $this->provider->id)
        ->assertJsonPath('data.services.0.heading', 'Tap repair')
        ->assertJsonPath('data.services.0.image_urls.0', 'http://localhost/uploads/catalogs/tap.jpg');
});

it('prevents an admin from featuring more than three professionals', function () {
    $this->provider->update(['is_featured' => true]);

    foreach (range(1, 2) as $number) {
        User::create([
            'name' => "Featured {$number}",
            'email' => "featured{$number}@catalog.test",
            'password' => Hash::make('password'),
            'user_type' => 'freelancer',
            'is_featured' => true,
        ]);
    }

    $fourthProvider = User::create([
        'name' => 'Fourth Provider',
        'email' => 'fourth@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'freelancer',
    ]);

    $request = Request::create('/admin/users/update_featured/'.$fourthProvider->id, 'POST', [
        'featured' => true,
    ]);
    $response = (new UserController())->update_featured($request, $fourthProvider->id);

    expect($response->getStatusCode())->toBe(422)
        ->and($response->getData(true)['status'])->toBeFalse()
        ->and($fourthProvider->fresh()->is_featured)->toBeFalse();
});

it('returns no more than three featured professionals for the home screen', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer-featured@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider->update(['is_featured' => true]);

    foreach (range(1, 3) as $number) {
        User::create([
            'name' => "Home Provider {$number}",
            'email' => "home{$number}@catalog.test",
            'password' => Hash::make('password'),
            'user_type' => 'freelancer',
            'is_featured' => true,
        ]);
    }

    Sanctum::actingAs($customer);

    $this->getJson('/api/client/discovery')
        ->assertOk()
        ->assertJsonCount(4, 'data.professionals')
        ->assertJsonCount(3, 'data.featured_professionals');
});

it('filters freelancer services by category skills', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer-category@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider->update(['skills' => 'plumber']);

    Illuminate\Support\Facades\DB::table('categories')->insert([
        ['id' => 1, 'name' => 'Plumber', 'slug' => 'plumber', 'photo' => 'plumber.png'],
        ['id' => 2, 'name' => 'Electrician', 'slug' => 'electrician', 'photo' => 'electrician.png'],
    ]);
    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'heading' => 'Tap repair',
        'description' => 'Repair a leaking tap.',
        'price' => '45.00',
        'images' => [],
        'status' => true,
    ]);

    Sanctum::actingAs($customer);

    $this->getJson('/api/client/discovery?category_id=1')
        ->assertOk()
        ->assertJsonCount(1, 'data.services');
    $this->getJson('/api/client/discovery?category_id=2')
        ->assertOk()
        ->assertJsonCount(0, 'data.services');
});

it('returns only catalogs assigned to the selected category for a multi skilled freelancer', function () {
    $customer = User::create([
        'name' => 'Customer',
        'email' => 'customer-exact-category@catalog.test',
        'password' => Hash::make('password'),
        'user_type' => 'client',
    ]);
    $this->provider->update(['skills' => '1,2']);

    Illuminate\Support\Facades\DB::table('categories')->insert([
        ['id' => 1, 'name' => 'Plumber', 'slug' => 'plumber', 'photo' => 'plumber.png'],
        ['id' => 2, 'name' => 'Electrician', 'slug' => 'electrician', 'photo' => 'electrician.png'],
    ]);
    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'category_id' => 1,
        'heading' => 'Tap repair',
        'description' => 'Repair a leaking tap.',
        'price' => '45.00',
        'images' => [],
    ]);
    ServiceCatalog::create([
        'provider_id' => $this->provider->id,
        'category_id' => 2,
        'heading' => 'Switchboard installation',
        'description' => 'Install an electrical switchboard.',
        'price' => '90.00',
        'images' => [],
    ]);

    Sanctum::actingAs($customer);

    $this->getJson('/api/client/discovery?category_id=1')
        ->assertOk()
        ->assertJsonCount(1, 'data.services')
        ->assertJsonPath('data.services.0.heading', 'Tap repair');
    $this->getJson('/api/client/discovery?category_id=2')
        ->assertOk()
        ->assertJsonCount(1, 'data.services')
        ->assertJsonPath('data.services.0.heading', 'Switchboard installation');
});

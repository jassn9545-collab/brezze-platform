<?php

// Additive fixtures for the local SQLite app smoke test. Never run on a live DB.
use App\Models\Bid;
use App\Models\Project;
use App\Models\User;
use App\Models\UserProof;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

$backend = dirname(__DIR__).'/apps/backend';
require $backend.'/vendor/autoload.php';
$app = require $backend.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if (! app()->environment('local') || config('database.default') !== 'sqlite') {
    throw new RuntimeException('This fixture requires APP_ENV=local and SQLite.');
}

foreach ([
    'users' => ['alternate_phone', 'refral_code', 'refrence', 'latitude', 'longitude', 'skills', 'experience', 'street_address', 'city', 'state', 'country', 'country_code', 'pincode', 'profile_title', 'profile_description', 'stripe_customer_id'],
    'projects' => ['description', 'address', 'city', 'country', 'pincode', 'latitude', 'longitude', 'modify_id'],
    'bids' => ['bid_amount', 'freelancer_name', 'freelancer_image', 'attachment', 'date_time', 'modify_at', 'end_date_time', 'work_attachment', 'work_description'],
] as $table => $columns) {
    foreach ($columns as $column) {
        if (! Schema::hasColumn($table, $column)) {
            Schema::table($table, fn (Blueprint $blueprint) => $blueprint->string($column)->nullable());
        }
    }
}

foreach ([
    'personal_access_tokens' => 'mograted/2026_01_05_150243_create_personal_access_tokens_table.php',
    'user_notifications' => '2026_10_07_000002_create_user_notifications_table.php',
    'service_catalogs' => '2026_09_30_000002_create_service_catalogs_table.php',
] as $table => $migration) {
    if (! Schema::hasTable($table)) {
        (require $backend.'/database/migrations/'.$migration)->up();
    }
}
if (! Schema::hasColumn('service_catalogs', 'category_id')) {
    Schema::table('service_catalogs', fn (Blueprint $table) => $table->unsignedBigInteger('category_id')->nullable());
}
if (! Schema::hasTable('user_proofs')) {
    Schema::create('user_proofs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('proof_type')->nullable();
        $table->string('id_number')->nullable();
        $table->date('expiry_date')->nullable();
        $table->string('front_image')->nullable();
        $table->string('back_image')->nullable();
        $table->integer('is_verified')->default(0);
        $table->timestamps();
    });
}
if (! Schema::hasTable('project_images')) {
    Schema::create('project_images', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->string('image')->nullable();
        $table->timestamp('created_at')->useCurrent();
    });
}
if (! Schema::hasTable('saved_projects')) {
    Schema::create('saved_projects', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->unsignedBigInteger('user_id');
        $table->timestamps();
    });
}
if (! Schema::hasTable('reviews')) {
    Schema::create('reviews', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('given_by');
        $table->unsignedBigInteger('given_to');
        $table->unsignedBigInteger('job_id');
        $table->unsignedTinyInteger('star');
        $table->text('review')->nullable();
        $table->string('review_to');
        $table->timestamps();
    });
}
if (! Schema::hasTable('proof_type')) {
    Schema::create('proof_type', function (Blueprint $table) {
        $table->id();
        $table->string('name');
    });
}

$credentialsFile = sys_get_temp_dir().'/bezzie-local-hire-credentials.json';
$oldCredentials = is_file($credentialsFile) ? json_decode(file_get_contents($credentialsFile), true) : [];
$password = $oldCredentials['password'] ?? bin2hex(random_bytes(12));
$admin = User::updateOrCreate(['email' => 'local.admin@example.test'], [
    'name' => 'Local Test Admin', 'password' => Hash::make($password), 'user_type' => 'admin',
]);
$users = [];
foreach ([['customer', 'client'], ['provider', 'freelancer']] as [$role, $type]) {
    $user = User::updateOrCreate(['email' => 'local.'.$role.'@example.test'], [
        'name' => 'Local Test '.ucfirst($role),
        'password' => Hash::make($password),
        'user_type' => $type,
        'is_verified' => 1,
        'dob' => '1990-01-01',
        'phone' => $role === 'customer' ? '0400000001' : '0400000002',
        'street_address' => 'Local fixture address',
        'city' => 'Local Test',
        'state' => 'NSW',
        'country' => 'AU',
        'pincode' => '2000',
        'skills' => '1',
        'refral_code' => 'LOCAL-'.strtoupper($role),
    ]);
    $user->forceFill(['email_verified_at' => now(), 'country_code' => '61'])->save();
    UserProof::updateOrCreate(['user_id' => $user->id], [
        'proof_type' => 'local-test-fixture', 'id_number' => 'LOCAL-ONLY', 'is_verified' => 1,
    ]);
    $users[$role] = $user;
}

DB::table('categories')->updateOrInsert(['slug' => 'local-test-service'], ['name' => 'Local Test Service']);
$project = Project::firstOrCreate(['slug' => 'local-hire-notification-smoke'], [
    'title' => 'Local hire notification test',
    'description' => 'Local fixture for Customer and Provider notification testing.',
    'budget' => '48.00',
    'status' => 'active',
    'user_id' => $users['customer']->id,
    'category' => 'Local Test Service',
    'address' => 'Local fixture address',
    'country' => 'AU',
]);
$bid = Bid::firstOrCreate(['project_id' => $project->id, 'user_id' => $users['provider']->id], [
    'bid_amount' => '48.00', 'freelancer_name' => $users['provider']->name,
    'date_time' => now(), 'is_hired' => false,
]);
file_put_contents($credentialsFile, json_encode([
    'customer_email' => $users['customer']->email,
    'provider_email' => $users['provider']->email,
    'admin_email' => $admin->email,
    'password' => $password,
    'customer_id' => $users['customer']->id,
    'provider_id' => $users['provider']->id,
    'project_id' => $project->id,
    'bid_id' => $bid->id,
], JSON_PRETTY_PRINT));
chmod($credentialsFile, 0600);
echo json_encode(['customer_id' => $users['customer']->id, 'provider_id' => $users['provider']->id, 'project_id' => $project->id, 'bid_id' => $bid->id, 'credentials_file' => $credentialsFile]).PHP_EOL;

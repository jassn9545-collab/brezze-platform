<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('user_profiles', function (Blueprint $table) {
        $table->id();

        $table->enum('user_type',['freelancer','client']);

        $table->string('full_name');
        $table->string('email')->unique();
        $table->string('phone')->nullable();
        $table->string('password');

        $table->string('profile_photo')->nullable();

        $table->date('dob')->nullable();
        $table->string('gender')->nullable();

        $table->string('country')->nullable();
        $table->string('city')->nullable();
        $table->text('address')->nullable();

        $table->json('skills')->nullable();
        $table->integer('experience_years')->default(0);
        $table->decimal('hourly_rate',10,2)->default(0);

        $table->string('company_name')->nullable();
        $table->string('website')->nullable();

        $table->text('bio')->nullable();

        $table->enum('account_status',['active','inactive','suspended'])->default('active');
        $table->boolean('is_verified')->default(false);

        $table->timestamp('last_login_at')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};

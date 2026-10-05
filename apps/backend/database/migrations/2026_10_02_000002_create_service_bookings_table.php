<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_catalog_id')->index();
            $table->unsignedBigInteger('client_id')->index();
            $table->unsignedBigInteger('provider_id')->index();
            $table->text('note')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('status', 20)->default('pending')->index();
            $table->unsignedBigInteger('project_id')->nullable()->index();
            $table->unsignedBigInteger('conversation_id')->nullable()->index();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'service_catalog_id', 'status']);
            $table->index(['provider_id', 'status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_bookings');
    }
};

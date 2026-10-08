<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('provider_id')->index();
            $table->decimal('requested_amount', 12, 2);
            $table->char('currency', 3)->default('aud');
            $table->string('status', 30)->default('pending')->index();
            $table->string('payment_reference')->nullable();
            $table->text('provider_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('processed_by')->nullable()->index();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};

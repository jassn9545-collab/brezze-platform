<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('project_id')->unique();
            $table->unsignedBigInteger('customer_id')->index();
            $table->unsignedBigInteger('provider_id')->index();
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('transaction_id')->nullable()->unique();
            $table->char('currency', 3)->default('aud');
            $table->unsignedBigInteger('amount_minor');
            $table->unsignedBigInteger('commission_minor');
            $table->unsignedBigInteger('provider_earnings_minor');
            $table->decimal('amount', 12, 2);
            $table->decimal('commission_amount', 12, 2);
            $table->decimal('provider_earnings', 12, 2);
            $table->decimal('commission_rate', 5, 2)->default(10);
            $table->string('status')->default('pending')->index();
            $table->unsignedInteger('attempts')->default(0);
            $table->string('failure_code')->nullable();
            $table->text('failure_message')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

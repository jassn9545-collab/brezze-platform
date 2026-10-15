<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->string('stripe_payout_id')->nullable()->unique()->after('payment_reference');
            $table->string('idempotency_key')->nullable()->after('stripe_payout_id');
            $table->string('destination')->nullable()->after('idempotency_key');
            $table->string('method', 20)->default('standard')->after('destination');
            $table->timestamp('arrival_at')->nullable()->after('method');
            $table->string('failure_code')->nullable()->after('arrival_at');
            $table->text('failure_message')->nullable()->after('failure_code');

            $table->unique(['provider_id', 'idempotency_key'], 'withdrawal_provider_idempotency_unique');
        });
    }

    public function down(): void
    {
        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->dropUnique('withdrawal_provider_idempotency_unique');
            $table->dropUnique(['stripe_payout_id']);
            $table->dropColumn([
                'stripe_payout_id',
                'idempotency_key',
                'destination',
                'method',
                'arrival_at',
                'failure_code',
                'failure_message',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->timestamp('stripe_submission_started_at')->nullable();
            $table->unsignedInteger('stripe_submission_attempt')->default(0);
        });
        // Legacy requests with unknown outcomes require reconciliation; never
        // treat their missing timestamp as permission to submit a new payout.
        \Illuminate\Support\Facades\DB::table('withdrawal_requests')
            ->where('status', 'processing')->whereNull('stripe_payout_id')
            ->update(['stripe_submission_started_at' => now()->subDay()]);
    }

    public function down(): void
    {
        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->dropColumn('stripe_submission_started_at');
            $table->dropColumn('stripe_submission_attempt');
        });
    }
};

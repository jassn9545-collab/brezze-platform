<?php

use App\Contracts\PayoutGateway;
use App\Models\WithdrawalRequest;
use App\Services\ProviderWallet;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('wallet:process-withdrawals', function (ProviderWallet $wallet, PayoutGateway $gateway) {
    // Reconcile signed-account payout state even if a webhook was missed,
    // including recovering a submitted payout whose HTTP response was lost.
    $providers = \App\Models\User::query()->whereIn('id', WithdrawalRequest::query()
        ->whereNotIn('status', ['failed', 'canceled', 'rejected'])->select('provider_id'))
        ->whereNotNull('stripe_account_id')->cursor();
    foreach ($providers as $provider) {
        try {
            $wallet->reconcile((int) $provider->id, $gateway->listPayouts($provider->stripe_account_id, 50));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
    WithdrawalRequest::query()
        ->whereIn('status', ['awaiting_settlement', 'processing'])
        ->whereNull('stripe_payout_id')
        ->orderBy('id')->chunkById(100, function ($withdrawals) use ($wallet, $gateway) {
            foreach ($withdrawals as $withdrawal) {
                $wallet->process($withdrawal, $gateway);
            }
        });
    $this->info('Pending wallet withdrawals checked.');
})->purpose('Submit reserved withdrawals when Stripe funds become available');

Schedule::command('wallet:process-withdrawals')->everyMinute()->withoutOverlapping();

Artisan::command('push:diagnose {user_id?} {--send : Send a test notification to this user}', function (\App\Services\FirebasePushService $firebase) {
    $diagnostics = $firebase->diagnostics();
    $this->line(json_encode($diagnostics));
    if (! $diagnostics['configured']) {
        $this->error('Set FIREBASE_CREDENTIALS to a readable Firebase service-account JSON file, then run php artisan config:cache.');

        return 1;
    }
    $userId = (int) $this->argument('user_id');
    if ($userId > 0) {
        $count = \App\Models\UserDevice::where('user_id', $userId)->where('enabled', true)->count();
        $this->line('Registered enabled devices: '.$count);
        if ($this->option('send')) {
            $result = $firebase->sendToUser($userId, 'Bezzie notification test', 'Push notifications are connected.', ['type' => 'test']);
            $this->line(json_encode($result));

            return $result['sent'] > 0 ? 0 : 1;
        }
    }

    return 0;
})->purpose('Check Firebase configuration and optionally test push delivery without exposing tokens');

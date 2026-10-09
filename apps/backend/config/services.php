<?php

return [

    'firebase' => [
        'credentials' => env('FIREBASE_CREDENTIALS'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'secret' => env('STRIPE_SECRET'),
        'key' => env('STRIPE_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'currency' => strtolower(env('STRIPE_CURRENCY', 'aud')),
        'onboarding_base_url' => env('STRIPE_ONBOARDING_BASE_URL', env('APP_URL')),
        // Test-mode charges stay on the platform so QA is not blocked while a
        // provider's Connect account is unfinished. Live-mode payments still
        // require a fully enabled connected account in PaymentController.
        'test_platform_payments' => env('STRIPE_TEST_PLATFORM_PAYMENTS', true),
    ],

    'metal_price' => [
        'key' => env('METAL_PRICE_API_KEY'),
    ],

];

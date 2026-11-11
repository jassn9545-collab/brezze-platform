<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stripe setup | Bezzie</title>
    <style>
        body { margin: 0; font: 16px/1.5 system-ui, sans-serif; color: #1f2937; background: #fff; }
        main { max-width: 32rem; margin: 18vh auto 0; padding: 0 1.5rem; }
        h1 { font-size: 1.5rem; line-height: 1.25; }
        .button { display: inline-block; margin: 1rem 0; padding: .8rem 1.2rem; border-radius: .5rem; background: #005aaa; color: #fff; text-decoration: none; }
    </style>
</head>
<body>
    @php($appUrl = 'bezzieprovider://stripe/onboarding/'.($refresh ? 'refresh' : 'return'))
    <main>
        @if ($refresh)
            <h1>Stripe setup link expired</h1>
            <p>Return to the Bezzie app and choose Continue Stripe setup to get a new link.</p>
        @else
            <h1>Return to Bezzie</h1>
            <p>Open the Bezzie app to check your Stripe account status and continue setup if needed.</p>
        @endif
        <a class="button" href="{{ $appUrl }}">Open Bezzie app</a>
        <p>If the app does not open automatically, tap the button above. Use the latest Bezzie Provider app.</p>
    </main>
    <script>
        // The app retrieves Stripe status after opening; returning here alone
        // does not mean the account has been approved.
        window.location.replace(@json($appUrl));
    </script>
</body>
</html>

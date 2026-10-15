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
    </style>
</head>
<body>
    <main>
        @if ($refresh)
            <h1>Stripe setup link expired</h1>
            <p>Return to the Bezzie app and choose Continue Stripe setup to get a new link.</p>
        @else
            <h1>Return to Bezzie</h1>
            <p>Open the Bezzie app to check your Stripe account status and continue setup if needed.</p>
        @endif
    </main>
</body>
</html>

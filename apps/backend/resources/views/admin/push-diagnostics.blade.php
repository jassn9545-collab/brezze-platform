<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Push diagnostics | Bezzie Admin</title>
    <style>
        body { margin: 0; background: #f4f6f8; color: #182330; font: 16px/1.5 system-ui, sans-serif; }
        main { max-width: 1100px; margin: 2rem auto; padding: 1.5rem; background: #fff; border-radius: 12px; }
        a { color: #005aaa; } table { width: 100%; border-collapse: collapse; }
        th, td { padding: .7rem; text-align: left; border-bottom: 1px solid #ddd; }
        .scroll { overflow-x: auto; } .notice { padding: 1rem; background: #edf4fb; margin: 1rem 0; }
        button { padding: .6rem 1rem; background: #005aaa; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
    </style>
</head>
<body><main>
    <a href="{{ route('admin.dashboard') }}">Back to dashboard</a>
    <h1>Push notification diagnostics</h1>
    <p>Use your own test account and phone. Only send a test when the account owner is expecting it.</p>
    <ul>
        <li>Readable service-account configuration: <strong>{{ $diagnostics['configured'] ? 'Yes' : 'No' }}</strong></li>
        <li>Firebase project: <strong>{{ $diagnostics['project_id'] ?? 'Missing' }}</strong></li>
        <li>Matches mobile project (our-bezzie-42461): <strong>{{ $diagnostics['matches_mobile_project'] ? 'Yes' : 'No' }}</strong></li>
        <li>PHP OpenSSL available: <strong>{{ $diagnostics['openssl_available'] ? 'Yes' : 'No' }}</strong></li>
        <li>Device registration table: <strong>{{ $hasDevices ? 'Present' : 'Missing — run database migrations' }}</strong></li>
    </ul>
    @if (!$diagnostics['configured'])
        <p class="notice">Set FIREBASE_CREDENTIALS to a readable service-account JSON file and refresh the Laravel configuration cache.</p>
    @elseif (!$diagnostics['matches_mobile_project'])
        <p class="notice">This backend is sending through a different Firebase project. Use the service account from our-bezzie-42461 to match the installed apps.</p>
    @endif
    @if ($result = session('push_result'))
        <div class="notice" role="status">
            <strong>Last test:</strong> {{ $result['devices'] }} enabled devices;
            {{ $result['sent'] }} accepted by FCM; {{ $result['failed'] }} failed.
            @if ($result['error']) <p>{{ $result['error'] }}</p> @endif
            <p>FCM acceptance does not confirm display. Check the phone with the app open, then in the background.</p>
            <p>SENDER_ID_MISMATCH: wrong Firebase project. PERMISSION_DENIED: check the Cloud Messaging API and service-account permissions.
            UNREGISTERED: reopen the app to register its current token. Authentication failures: check the server log, service-account key and server clock.</p>
        </div>
    @endif
    @foreach ($errors->all() as $error) <p role="alert">{{ $error }}</p> @endforeach
    <h2>Registered devices</h2>
    <p>If your account is absent, open the app while signed in and refresh this page. Last registration should update when the app resumes.</p>
    <div class="scroll"><table>
        <thead><tr><th>User</th><th>App</th><th>Platform</th><th>Enabled</th><th>Last registration (server time)</th><th>Test</th></tr></thead>
        <tbody>
        @forelse ($devices ?? [] as $device)
            <tr>
                <td>{{ $device->user?->name ?? 'Unknown user' }} (#{{ $device->user_id }})</td>
                <td>{{ config('mobile_apps.'.$device->app_type.'.name', $device->app_type) }}
                    <small>({{ $device->app_type }})</small></td><td>{{ $device->platform }}</td>
                <td>{{ $device->enabled ? 'Yes' : 'No' }}</td><td>{{ $device->last_seen_at ?? 'Unknown' }}</td>
                <td>@if ($device->enabled)
                    <form method="post" action="{{ route('admin.push-diagnostics.test') }}">
                        @csrf
                        <input type="hidden" name="user_id" value="{{ $device->user_id }}">
                        <button type="submit">Send test to this user</button>
                    </form>
                @endif</td>
            </tr>
        @empty
            <tr><td colspan="6">No registered devices.</td></tr>
        @endforelse
        </tbody>
    </table></div>
    @if ($devices?->hasMorePages()) <a href="{{ $devices->nextPageUrl() }}">Next page</a> @endif
</main></body></html>

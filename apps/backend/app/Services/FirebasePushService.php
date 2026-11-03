<?php

namespace App\Services;

use App\Models\UserDevice;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class FirebasePushService
{
    public function sendToUser(int $userId, string $title, string $body, array $data = []): array
    {
        $result = ['sent' => 0, 'failed' => 0, 'devices' => 0, 'error' => null];
        try {
            $credentials = $this->credentials();
            if (! $credentials) {
                Log::warning('Firebase push is not configured: service-account credentials are missing or invalid.');

                return [...$result, 'error' => 'Firebase service-account credentials are missing or invalid.'];
            }

            $tokens = UserDevice::query()
                ->where('user_id', $userId)
                ->where('enabled', true)
                ->pluck('token');
        } catch (Throwable $exception) {
            Log::warning('Firebase push recipient lookup failed.', [
                'message' => $exception->getMessage(),
                'user_id' => $userId,
            ]);

            return [...$result, 'error' => 'Notification device lookup failed.'];
        }

        $result['devices'] = $tokens->count();
        if ($tokens->isEmpty()) {
            return [...$result, 'error' => 'No enabled devices registered. Open the app and sign in again.'];
        }

        foreach ($tokens as $token) {
            try {
                // A revoked/expired cached OAuth token must not block all push
                // delivery until the cache expires. Refresh and retry once.
                for ($attempt = 0; $attempt < 2; $attempt++) {
                    $response = Http::withToken($this->accessToken($credentials))
                        ->timeout(15)
                        ->acceptJson()
                        ->post(
                            'https://fcm.googleapis.com/v1/projects/'.$credentials['project_id'].'/messages:send',
                            [
                                'message' => [
                                    'token' => $token,
                                    'notification' => ['title' => $title, 'body' => $body],
                                    'data' => collect($data)->map(fn ($value) => (string) $value)->all(),
                                    'android' => [
                                        'priority' => 'high',
                                        'notification' => ['sound' => 'default', 'channel_id' => 'bezzie_updates'],
                                    ],
                                    'apns' => [
                                        'headers' => ['apns-priority' => '10'],
                                        'payload' => ['aps' => ['sound' => 'default']],
                                    ],
                                ],
                            ]
                        );
                    if ($response->status() !== 401 || $attempt === 1) {
                        break;
                    }
                    Cache::forget($this->accessTokenCacheKey($credentials));
                }

                $fcmError = collect(data_get($response->json(), 'error.details', []))
                    ->firstWhere('@type', 'type.googleapis.com/google.firebase.fcm.v1.FcmError')['errorCode'] ?? null;
                if ($response->successful()) {
                    $result['sent']++;
                } else {
                    $result['failed']++;
                    $result['error'] = $fcmError ?? data_get($response->json(), 'error.status', 'FCM_REQUEST_FAILED');
                    Log::warning('Firebase push delivery failed.', ['status' => $response->status(), 'user_id' => $userId, 'fcm_error' => $result['error']]);
                }
                if ($fcmError === 'UNREGISTERED') {
                    UserDevice::query()->where('token', $token)->update(['enabled' => false]);
                }
            } catch (Throwable $exception) {
                $result['failed']++;
                $result['error'] = 'Firebase authentication or delivery failed; check server logs.';
                Log::warning('Firebase push delivery exception.', ['message' => $exception->getMessage(), 'user_id' => $userId]);
            }
        }

        return $result;
    }

    public function diagnostics(): array
    {
        $credentials = $this->credentials();

        return [
            'configured' => (bool) $credentials,
            'project_id' => $credentials['project_id'] ?? null,
            'matches_mobile_project' => ($credentials['project_id'] ?? null) === 'our-bezzie-42461',
            'openssl_available' => function_exists('openssl_sign'),
        ];
    }

    private function credentials(): ?array
    {
        $path = (string) config('services.firebase.credentials');
        if ($path === '') {
            return null;
        }

        $resolved = str_starts_with($path, '/') || preg_match('/^[A-Za-z]:[\\\\\/]/', $path)
            ? $path
            : base_path($path);
        if (! is_file($resolved)) {
            return null;
        }

        $credentials = json_decode((string) file_get_contents($resolved), true);
        if (! is_array($credentials) || empty($credentials['client_email'])
            || empty($credentials['private_key']) || empty($credentials['project_id'])) {
            return null;
        }

        return $credentials;
    }

    private function accessToken(array $credentials): string
    {
        $cacheKey = $this->accessTokenCacheKey($credentials);

        return Cache::remember($cacheKey, now()->addMinutes(50), function () use ($credentials) {
            $now = time();
            $header = $this->base64Url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claims = $this->base64Url(json_encode([
                'iss' => $credentials['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => $credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ]));
            $unsigned = $header.'.'.$claims;
            if (! openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
                throw new RuntimeException('Unable to sign the Firebase service-account token.');
            }

            $jwt = $unsigned.'.'.$this->base64Url($signature);
            $response = Http::asForm()->post(
                $credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token',
                ['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $jwt]
            )->throw();

            return (string) $response->json('access_token');
        });
    }

    private function accessTokenCacheKey(array $credentials): string
    {
        return 'firebase_access_token:'.hash('sha256', $credentials['project_id'].'|'.$credentials['client_email']);
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}

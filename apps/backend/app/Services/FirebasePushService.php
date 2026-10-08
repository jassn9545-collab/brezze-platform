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
    public function sendToUser(int $userId, string $title, string $body, array $data = []): void
    {
        try {
            $credentials = $this->credentials();
            if (!$credentials) {
                return;
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

            return;
        }

        foreach ($tokens as $token) {
            try {
                $response = Http::withToken($this->accessToken($credentials))
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
                                    'notification' => ['sound' => 'default'],
                                ],
                                'apns' => [
                                    'headers' => ['apns-priority' => '10'],
                                    'payload' => ['aps' => ['sound' => 'default']],
                                ],
                            ],
                        ]
                    );

                $fcmError = data_get($response->json(), 'error.details.0.errorCode');
                if (in_array($fcmError, ['UNREGISTERED', 'INVALID_ARGUMENT'], true)) {
                    UserDevice::query()->where('token', $token)->update(['enabled' => false]);
                } elseif ($response->failed()) {
                    Log::warning('Firebase push delivery failed.', ['status' => $response->status(), 'user_id' => $userId]);
                }
            } catch (Throwable $exception) {
                Log::warning('Firebase push delivery exception.', ['message' => $exception->getMessage(), 'user_id' => $userId]);
            }
        }
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
        if (!is_file($resolved)) {
            return null;
        }

        $credentials = json_decode((string) file_get_contents($resolved), true);
        if (!is_array($credentials) || empty($credentials['client_email'])
            || empty($credentials['private_key']) || empty($credentials['project_id'])) {
            return null;
        }

        return $credentials;
    }

    private function accessToken(array $credentials): string
    {
        return Cache::remember('firebase_access_token', now()->addMinutes(50), function () use ($credentials) {
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
            if (!openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
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

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}

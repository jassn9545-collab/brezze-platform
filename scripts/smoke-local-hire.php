<?php

declare(strict_types=1);

$repository = dirname(__DIR__);
$credentialsPath = getenv('BEZZIE_LOCAL_CREDENTIALS') ?: sys_get_temp_dir().'/bezzie-local-hire-credentials.json';
$apiBase = rtrim(getenv('BEZZIE_API_BASE') ?: 'http://127.0.0.1:8000/api', '/');

if (! is_file($credentialsPath)) {
    fwrite(STDERR, "Local credentials are missing. Run scripts/prepare-local-hire-test.php first.\n");
    exit(1);
}

$credentials = json_decode((string) file_get_contents($credentialsPath), true, flags: JSON_THROW_ON_ERROR);
$database = new PDO('sqlite:'.$repository.'/apps/backend/database/database.sqlite');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->beginTransaction();
$database->prepare('UPDATE projects SET status = ? WHERE id = ?')
    ->execute(['active', $credentials['project_id']]);
$database->prepare('UPDATE bids SET is_hired = 0 WHERE project_id = ?')
    ->execute([$credentials['project_id']]);
$database->prepare("DELETE FROM user_notifications WHERE type = 'job_in_progress' AND action_id = ? AND user_id IN (?, ?)")
    ->execute([$credentials['project_id'], $credentials['customer_id'], $credentials['provider_id']]);
$database->commit();

function request(string $method, string $url, array $payload = [], ?string $token = null): array
{
    $handle = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token !== null) {
        $headers[] = 'Authorization: Bearer '.$token;
    }

    curl_setopt_array($handle, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    if ($payload !== []) {
        curl_setopt($handle, CURLOPT_POSTFIELDS, json_encode($payload, JSON_THROW_ON_ERROR));
    }

    $body = curl_exec($handle);
    if ($body === false) {
        throw new RuntimeException(curl_error($handle));
    }
    $status = curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    curl_close($handle);

    return ['http_status' => $status, 'body' => json_decode($body, true, flags: JSON_THROW_ON_ERROR)];
}

function login(string $apiBase, string $email, string $password, string $userType): array
{
    $response = request('POST', $apiBase.'/login', [
        'email' => $email,
        'password' => $password,
        'user_type' => $userType,
    ]);
    if ($response['http_status'] !== 200 || ($response['body']['status'] ?? null) !== 'success') {
        throw new RuntimeException('Login failed for '.$userType.'.');
    }

    return $response['body'];
}

try {
    $customer = login($apiBase, $credentials['customer_email'], $credentials['password'], 'client');
    $provider = login($apiBase, $credentials['provider_email'], $credentials['password'], 'freelancer');
    $hire = request('POST', $apiBase.'/client/hire-now', [
        'job_id' => $credentials['project_id'],
        'bid_id' => $credentials['bid_id'],
    ], $customer['data']['token']);

    if ($hire['http_status'] !== 200 || ($hire['body']['status'] ?? null) !== 'success') {
        throw new RuntimeException('Hire request failed.');
    }

    usleep(200000);
    $customerNotifications = request('GET', $apiBase.'/notifications', token: $customer['data']['token']);
    $providerNotifications = request('GET', $apiBase.'/notifications', token: $provider['data']['token']);

    $hasHireNotification = static function (array $response) use ($credentials): bool {
        foreach ($response['body']['data']['notifications'] ?? [] as $notification) {
            if (($notification['type'] ?? null) === 'job_in_progress'
                && (int) ($notification['action_id'] ?? 0) === (int) $credentials['project_id']) {
                return true;
            }
        }

        return false;
    };

    $summary = [
        'customer_login' => 'passed',
        'provider_login' => 'passed',
        'hire_request' => ($hire['body']['data']['job']['status'] ?? null) === 'in progress' ? 'passed' : 'failed',
        'customer_hire_notification' => $hasHireNotification($customerNotifications) ? 'passed' : 'failed',
        'provider_hire_notification' => $hasHireNotification($providerNotifications) ? 'passed' : 'failed',
        'project_id' => $credentials['project_id'],
        'bid_id' => $credentials['bid_id'],
    ];

    echo json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL;
    exit(in_array('failed', $summary, true) ? 1 : 0);
} catch (Throwable $exception) {
    fwrite(STDERR, 'Local hire smoke test failed: '.$exception->getMessage().PHP_EOL);
    exit(1);
}

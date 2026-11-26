<?php
declare(strict_types=1);

/**
 * Danat Build direct-ad banner uploader.
 * Install this file at:
 * public_html/pub/danat-build-banners/upload.php
 *
 * No FTP credentials or private API keys are used by this endpoint.
 */

const FIREBASE_PROJECT_ID = 'danat-build';
const ADMIN_UID = 'psu8GgwqNUSKHSQER9wkcEKbbz22';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PUBLIC_BASE_URL = 'https://danatstore.com/danat-build-banners/';

function respond(int $status, array $body): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

$allowedOrigins = [
    'https://danatstores-wq.github.io',
    'https://danatstore.com',
    'https://www.danatstore.com',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    if (!in_array($origin, $allowedOrigins, true)) {
        respond(403, ['error' => 'Origin not allowed.']);
    }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Max-Age: 600');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['error' => 'Use POST to upload a banner.']);
}

function base64url_decode_strict(string $value): string|false {
    $decoded = base64_decode(strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4), true);
    return $decoded;
}

function fetch_firebase_certificates(): array {
    $cacheFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'danat-build-firebase-certs.json';
    if (is_file($cacheFile) && filemtime($cacheFile) > time() - 3600) {
        $cached = json_decode((string) file_get_contents($cacheFile), true);
        if (is_array($cached)) return $cached;
    }

    $url = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    $certJson = false;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $certJson = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status !== 200) $certJson = false;
    } else {
        $context = stream_context_create(['http' => ['timeout' => 10], 'ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
        $certJson = @file_get_contents($url, false, $context);
    }

    $certs = is_string($certJson) ? json_decode($certJson, true) : null;
    if (!is_array($certs) || !$certs) {
        if (is_file($cacheFile)) {
            $cached = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($cached)) return $cached;
        }
        throw new RuntimeException('Could not retrieve Firebase signing certificates.');
    }
    @file_put_contents($cacheFile, json_encode($certs), LOCK_EX);
    return $certs;
}

function verify_firebase_id_token(string $jwt): array {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) throw new RuntimeException('Invalid sign-in token.');
    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    $header = json_decode((string) base64url_decode_strict($encodedHeader), true);
    $claims = json_decode((string) base64url_decode_strict($encodedPayload), true);
    $signature = base64url_decode_strict($encodedSignature);
    if (!is_array($header) || !is_array($claims) || $signature === false || ($header['alg'] ?? '') !== 'RS256' || empty($header['kid'])) {
        throw new RuntimeException('Invalid sign-in token format.');
    }

    $now = time();
    if (($claims['aud'] ?? '') !== FIREBASE_PROJECT_ID ||
        ($claims['iss'] ?? '') !== 'https://securetoken.google.com/' . FIREBASE_PROJECT_ID ||
        !isset($claims['exp'], $claims['iat'], $claims['auth_time'], $claims['sub']) ||
        !is_numeric($claims['exp']) || (int) $claims['exp'] <= $now ||
        !is_numeric($claims['iat']) || (int) $claims['iat'] > $now + 60 ||
        !is_numeric($claims['auth_time']) || (int) $claims['auth_time'] > $now + 60 ||
        !is_string($claims['sub']) || $claims['sub'] === '' || strlen($claims['sub']) > 128) {
        throw new RuntimeException('Sign-in token is expired or not valid for this app.');
    }

    $certs = fetch_firebase_certificates();
    $cert = $certs[$header['kid']] ?? null;
    if (!is_string($cert)) throw new RuntimeException('Unknown Firebase signing key.');
    $publicKey = openssl_pkey_get_public($cert);
    if ($publicKey === false) throw new RuntimeException('Could not read Firebase signing key.');
    $verified = openssl_verify($encodedHeader . '.' . $encodedPayload, $signature, $publicKey, OPENSSL_ALGO_SHA256);
    if ($verified !== 1) throw new RuntimeException('Sign-in token signature is invalid.');

    return $claims;
}

$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) {
    respond(401, ['error' => 'Sign in before uploading.']);
}
try {
    $claims = verify_firebase_id_token(trim($matches[1]));
} catch (Throwable $error) {
    respond(401, ['error' => 'Your sign-in could not be verified. Please sign in again.']);
}
if (($claims['sub'] ?? '') !== ADMIN_UID) {
    respond(403, ['error' => 'Only the authorized administrator can upload banners.']);
}

if (!isset($_FILES['banner']) || !is_array($_FILES['banner'])) {
    respond(400, ['error' => 'Choose a banner image first.']);
}
$upload = $_FILES['banner'];
if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    $code = (int) ($upload['error'] ?? UPLOAD_ERR_NO_FILE);
    respond($code === UPLOAD_ERR_INI_SIZE || $code === UPLOAD_ERR_FORM_SIZE ? 413 : 400, ['error' => 'The image could not be received. Please try a file smaller than 5 MB.']);
}
$tmp = (string) ($upload['tmp_name'] ?? '');
$size = (int) ($upload['size'] ?? 0);
if ($size < 1 || $size > MAX_UPLOAD_BYTES || !is_uploaded_file($tmp)) {
    respond(413, ['error' => 'Choose an image smaller than 5 MB.']);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($tmp);
$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
if (!is_string($mime) || !isset($allowedTypes[$mime])) {
    respond(415, ['error' => 'Only JPG, PNG and WebP images are accepted.']);
}
$imageInfo = @getimagesize($tmp);
if (!is_array($imageInfo) || ($imageInfo['mime'] ?? '') !== $mime) {
    respond(415, ['error' => 'The uploaded file is not a valid image.']);
}

$filename = 'banner-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(8)) . '.' . $allowedTypes[$mime];
$destination = __DIR__ . DIRECTORY_SEPARATOR . $filename;
if (!is_writable(__DIR__) || !move_uploaded_file($tmp, $destination)) {
    respond(500, ['error' => 'The banner folder is not writable by the website server.']);
}
@chmod($destination, 0644);
respond(200, ['imageUrl' => PUBLIC_BASE_URL . rawurlencode($filename)]);

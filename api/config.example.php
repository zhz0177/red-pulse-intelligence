<?php
// ============================================================
// 红脉智联 - 数据库配置 (复制为 config.php 后修改)
// ============================================================

// ★★★ 改成你宝塔里创建的数据库信息 ★★★
$DB_HOST = '127.0.0.1';
$DB_NAME = 'red-pulse';
$DB_USER = 'red-pulse';
$DB_PASS = '你的数据库密码';           // ← 填你的数据库密码
$DB_PORT = 3306;

// Token 密钥 (随便改一个字符串)
$SECRET = '改成一个随机字符串';

// Doubao (豆包) API Key
$AI_KEY = '你的豆包API Key';
$AI_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';
$AI_MODEL = 'doubao-seed-1-8-251228';

// 跨域 + JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// PDO 连接
try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER, $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['code' => 500, 'message' => '数据库连接失败: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

// 工具函数
function ok($data = null, $msg = 'ok') {
    echo json_encode(['code' => 0, 'message' => $msg, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['code' => $code, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
function input() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}
function getToken() {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    return str_replace('Bearer ', '', $h);
}
function checkLogin() {
    global $pdo, $SECRET;
    $token = getToken();
    if (!$token) fail('请先登录', 401);
    $parts = explode('.', $token);
    if (count($parts) !== 3) fail('token无效', 401);
    $uid = (int)$parts[0];
    $check = md5($uid . '.' . $parts[1] . '.' . $SECRET);
    if ($check !== $parts[2]) fail('token无效', 401);
    $stmt = $pdo->prepare('SELECT id, username, role FROM users WHERE id = ?');
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user) fail('用户不存在', 401);
    return $user;
}
function addBeans($userId, $amount, $reason) {
    global $pdo;
    if ($amount <= 0) return;
    $pdo->prepare('UPDATE users SET beans = beans + ? WHERE id = ?')->execute([$amount, $userId]);
    $pdo->prepare('INSERT INTO bean_transactions (user_id, amount, reason) VALUES (?, ?, ?)')->execute([$userId, $amount, $reason]);
}

function makeToken($uid) {
    global $SECRET;
    $ts = time();
    return $uid . '.' . $ts . '.' . md5($uid . '.' . $ts . '.' . $SECRET);
}

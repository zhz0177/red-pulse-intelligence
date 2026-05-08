<?php
// AI 聊天接口: ai.php (流式输出，使用火山引擎 Responses API)
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method Not Allowed', 405);

// 需要登录
checkLogin();

$data = input();
$messages = $data['messages'] ?? [];
if (empty($messages)) fail('messages不能为空');

// 系统提示词
$systemInstruction = '你是"红脉智联"红色文化传承平台的AI助手。你擅长解读红色文化、革命历史、烈士事迹、家书文献等内容。同时你也是一个通用智能助手，可以回答用户的各种问题。请用简洁、准确、富有人文关怀的语言回答。';

// 将 messages 转换为 Responses API 的 input 格式
$input = [];
foreach ($messages as $msg) {
    $role = $msg['role'] ?? 'user';
    if ($role === 'system') continue;
    $contentType = ($role === 'assistant') ? 'output_text' : 'input_text';
    $input[] = [
        'role' => $role,
        'content' => [
            ['type' => $contentType, 'text' => $msg['content'] ?? '']
        ]
    ];
}

// 切换为 SSE 流式输出
header('Content-Type: text/event-stream; charset=utf-8');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

while (ob_get_level()) ob_end_flush();

global $AI_KEY, $AI_URL, $AI_MODEL;

$requestBody = json_encode([
    'model' => $AI_MODEL,
    'instructions' => $systemInstruction,
    'input' => $input,
    'stream' => true,
], JSON_UNESCAPED_UNICODE);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $AI_URL,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $requestBody,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $AI_KEY,
    ],
    // ★ 宝塔服务器常见问题：SSL 证书验证失败导致请求无响应
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_WRITEFUNCTION  => function ($ch, $data) {
        echo $data;
        if (ob_get_level()) ob_flush();
        flush();
        return strlen($data);
    },
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_CONNECTTIMEOUT => 15,
]);

curl_exec($ch);

$errno  = curl_errno($ch);
$errmsg = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 如果 curl 出错或 HTTP 状态码异常，把错误发给前端
if ($errno || ($httpCode && $httpCode >= 400)) {
    $errInfo = $errno ? "curl error($errno): $errmsg" : "HTTP $httpCode";
    echo "\n\nevent: error\ndata: " . json_encode([
        'type' => 'error',
        'message' => "AI 接口请求失败: $errInfo"
    ]) . "\n\n";
    flush();
}

<?php
// 豆包 AI 小精灵聊天接口 (流式输出)
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method Not Allowed', 405);

$data = input();
$message = trim($data['message'] ?? '');
if ($message === '') fail('message不能为空');

$systemInstruction = '你是"红脉智联"平台的红色文化小助手，一个可爱的小精灵形象。你擅长解读红色文化、革命历史、烈士事迹、家书文献等内容，同时也能回答用户的各种问题。请用简洁、亲切、富有人文关怀的语言回答，适当使用emoji让对话更活泼。回答尽量控制在200字以内。';

$input = [
    ['role' => 'user', 'content' => [['type' => 'input_text', 'text' => $message]]]
];

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
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_WRITEFUNCTION  => function ($ch, $data) {
        echo $data;
        if (ob_get_level()) ob_flush();
        flush();
        return strlen($data);
    },
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_CONNECTTIMEOUT => 15,
]);

curl_exec($ch);

$errno  = curl_errno($ch);
$errmsg = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($errno || ($httpCode && $httpCode >= 400)) {
    $errInfo = $errno ? "curl error($errno): $errmsg" : "HTTP $httpCode";
    echo "\n\nevent: error\ndata: " . json_encode([
        'type' => 'error',
        'message' => "AI 接口请求失败: $errInfo"
    ]) . "\n\n";
    flush();
}

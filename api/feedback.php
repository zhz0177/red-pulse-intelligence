<?php
// 评价接口: feedback.php?action=create
require_once __DIR__ . '/config.php';

$user = checkLogin();
$data = input();
$subId = $data['submission_id'] ?? 0;
$rating = (int)($data['rating'] ?? 5);
$comment = trim($data['comment'] ?? '');

$stmt = $pdo->prepare('SELECT id FROM feedbacks WHERE submission_id = ?');
$stmt->execute([$subId]);
if ($stmt->fetch()) fail('已评价过');

$stmt = $pdo->prepare('INSERT INTO feedbacks (submission_id, rating, comment) VALUES (?, ?, ?)');
$stmt->execute([$subId, $rating, $comment]);
ok(null, '评价成功');

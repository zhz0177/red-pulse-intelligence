<?php
// 家书接口: letters.php?martyr_id=1 / letters.php?action=reply / letters.php?action=replies&letter_id=1
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'get';

switch ($action) {
    case 'get':
        $martyrId = $_GET['martyr_id'] ?? 0;
        $stmt = $pdo->prepare('SELECT * FROM letters WHERE martyr_id = ? LIMIT 1');
        $stmt->execute([$martyrId]);
        $letter = $stmt->fetch();
        if (!$letter) fail('家书不存在', 404);
        $letter['photos'] = json_decode($letter['photos'], true);
        ok($letter);
        break;

    case 'replies':
        $letterId = $_GET['letter_id'] ?? 0;
        $stmt = $pdo->prepare('SELECT r.*, u.username FROM replies r LEFT JOIN users u ON r.user_id = u.id WHERE r.letter_id = ? ORDER BY r.created_at DESC');
        $stmt->execute([$letterId]);
        ok($stmt->fetchAll());
        break;

    case 'reply':
        $user = checkLogin();
        $data = input();
        $letterId = $data['letter_id'] ?? 0;
        $content = trim($data['content'] ?? '');
        if (!$content) fail('回信内容不能为空');

        $stmt = $pdo->prepare('INSERT INTO replies (letter_id, user_id, content) VALUES (?, ?, ?)');
        $stmt->execute([$letterId, $user['id'], $content]);
        ok(null, '回信成功');
        break;

    default:
        fail('未知操作');
}

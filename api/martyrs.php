<?php
// 烈士接口: martyrs.php / martyrs.php?id=1 / martyrs.php?action=featured
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

function normalizeMartyr(&$r) {
    $r['route'] = json_decode($r['route'], true) ?: [];
    $r['routeLabels'] = json_decode($r['route_labels'], true) ?: [];
    $r['timeline'] = json_decode($r['timeline'], true) ?: [];
    $r['lat'] = (float)$r['lat'];
    $r['lng'] = (float)$r['lng'];
    unset($r['route_labels']);
}

if ($action === 'featured') {
    // 联查 martyrs + letters，返回首页英雄展示数据
    $rows = $pdo->query('
        SELECT m.id, m.name, m.avatar, m.bio, m.route, m.route_labels, m.lat, m.lng,
               l.id AS letter_id
        FROM martyrs m
        LEFT JOIN letters l ON l.martyr_id = m.id
        ORDER BY m.id ASC
    ')->fetchAll();
    foreach ($rows as &$r) {
        $r['route'] = json_decode($r['route'], true) ?: [];
        $r['routeLabels'] = json_decode($r['route_labels'], true) ?: [];
        $r['lat'] = (float)$r['lat'];
        $r['lng'] = (float)$r['lng'];
        $r['has_letter'] = !empty($r['letter_id']);
        $r['letter_id'] = $r['letter_id'] ? (int)$r['letter_id'] : null;
        unset($r['route_labels']);
    }
    ok($rows);
} elseif ($id) {
    $stmt = $pdo->prepare('SELECT * FROM martyrs WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) fail('烈士信息不存在', 404);
    normalizeMartyr($row);
    ok($row);
} else {
    $rows = $pdo->query('SELECT * FROM martyrs ORDER BY id ASC')->fetchAll();
    foreach ($rows as &$r) {
        normalizeMartyr($r);
    }
    ok($rows);
}

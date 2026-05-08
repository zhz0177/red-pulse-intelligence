<?php
// 管理接口: admin.php?action=stats / users / createUser / updateUser / deleteUser
require_once __DIR__ . '/config.php';

$user = checkLogin();
if ($user['role'] !== 'admin') fail('无权限', 403);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'stats':
        $photos = $pdo->query("SELECT COUNT(*) FROM submissions s JOIN projects p ON s.project_id = p.id WHERE s.review_status = '通过' AND p.category = '照片修复'")->fetchColumn();
        $volunteers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'volunteer'")->fetchColumn();
        $martyrs = $pdo->query("SELECT COUNT(*) FROM martyrs")->fetchColumn();
        ok(['photos' => (int)$photos, 'volunteers' => (int)$volunteers, 'martyrs' => (int)$martyrs]);
        break;

    case 'users':
        $rows = $pdo->query('SELECT u.id, u.username, u.role, u.created_at AS createdAt, (SELECT COUNT(*) FROM submissions s WHERE s.user_id = u.id) AS orderCount FROM users u ORDER BY u.id ASC')->fetchAll();
        ok($rows);
        break;

    case 'createUser':
        $data = input();
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'volunteer';
        if (!$username || !$password) fail('用户名和密码不能为空');
        if (mb_strlen($password) < 6) fail('密码至少6位');
        if (!in_array($role, ['admin', 'volunteer'])) $role = 'volunteer';

        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) fail('用户名已存在');

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        $stmt->execute([$username, $hash, $role]);
        $uid = $pdo->lastInsertId();
        ok(['id' => (int)$uid, 'username' => $username, 'role' => $role], '创建成功');
        break;

    case 'updateUser':
        $data = input();
        $id = (int)($data['id'] ?? 0);
        if (!$id) fail('缺少用户ID');

        $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) fail('用户不存在', 404);

        $username = trim($data['username'] ?? $target['username']);
        $role = $data['role'] ?? $target['role'];
        if (!in_array($role, ['admin', 'volunteer'])) $role = $target['role'];

        // 检查用户名是否被其他人占用
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$username, $id]);
        if ($stmt->fetch()) fail('用户名已被占用');

        // 如果传了新密码就更新密码
        $password = $data['password'] ?? '';
        if ($password) {
            if (mb_strlen($password) < 6) fail('密码至少6位');
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?');
            $stmt->execute([$username, $hash, $role, $id]);
        } else {
            $stmt = $pdo->prepare('UPDATE users SET username = ?, role = ? WHERE id = ?');
            $stmt->execute([$username, $role, $id]);
        }
        ok(['id' => $id, 'username' => $username, 'role' => $role], '更新成功');
        break;

    case 'deleteUser':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) fail('用户不存在', 404);
        if ($target['role'] === 'admin') fail('不能删除管理员');
        $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
        ok(null, '删除成功');
        break;

    // 管理端获取项目列表(含提交详情)
    case 'projects':
        $projects = $pdo->query('SELECT * FROM projects ORDER BY id DESC')->fetchAll();
        foreach ($projects as &$p) {
            $stmt = $pdo->prepare(
                'SELECT s.*, u.username,
                 (SELECT JSON_OBJECT("rating", f.rating, "comment", f.comment) FROM feedbacks f WHERE f.submission_id = s.id LIMIT 1) AS feedback
                 FROM submissions s LEFT JOIN users u ON s.user_id = u.id WHERE s.project_id = ? ORDER BY s.created_at DESC'
            );
            $stmt->execute([$p['id']]);
            $subs = $stmt->fetchAll();
            foreach ($subs as &$s) {
                $s['feedback'] = $s['feedback'] ? json_decode($s['feedback'], true) : null;
            }
            $p['submissions'] = $subs;
            $p['pendingCount'] = count(array_filter($subs, fn($s) => $s['review_status'] === '待审'));
        }
        ok($projects);
        break;

    default:
        fail('未知操作');
}

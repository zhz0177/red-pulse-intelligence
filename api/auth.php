<?php
// 认证接口: auth.php?action=login / register / info / changePassword / updateProfile
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

try {
switch ($action) {
    case 'login':
        $data = input();
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        if (!$username || !$password) fail('用户名和密码不能为空');

        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password'])) fail('用户名或密码错误', 401);

        ok([
            'token' => makeToken($user['id']),
            'user'  => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role'], 'beans' => (int)($user['beans'] ?? 0)]
        ], '登录成功');
        break;

    case 'register':
        $data = input();
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        if (!$username || !$password) fail('用户名和密码不能为空');
        if (mb_strlen($password) < 6) fail('密码至少6位');

        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) fail('用户名已存在');

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, "volunteer")');
        $stmt->execute([$username, $hash]);
        $uid = $pdo->lastInsertId();

        // 注册送 50 传承豆
        try { addBeans((int)$uid, 50, '注册奖励'); } catch (Exception $e) {}

        ok([
            'token' => makeToken($uid),
            'user'  => ['id' => (int)$uid, 'username' => $username, 'role' => 'volunteer', 'beans' => 50]
        ], '注册成功');
        break;

    case 'info':
        $user = checkLogin();
        $stmt = $pdo->prepare('SELECT id, username, role, phone, wechat, created_at AS createdAt, beans FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        ok($stmt->fetch());
        break;

    case 'changePassword':
        $user = checkLogin();
        $data = input();
        $oldPwd = $data['oldPassword'] ?? '';
        $newPwd = $data['newPassword'] ?? '';
        if (!$oldPwd || !$newPwd) fail('请填写旧密码和新密码');
        if (mb_strlen($newPwd) < 6) fail('新密码至少6位');

        $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();
        if (!password_verify($oldPwd, $row['password'])) fail('旧密码错误');

        $hash = password_hash($newPwd, PASSWORD_BCRYPT);
        $pdo->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([$hash, $user['id']]);
        ok(null, '密码修改成功');
        break;

    case 'updateProfile':
        $user = checkLogin();
        $data = input();
        $phone = trim($data['phone'] ?? '');
        $wechat = trim($data['wechat'] ?? '');
        $pdo->prepare('UPDATE users SET phone = ?, wechat = ? WHERE id = ?')->execute([$phone, $wechat, $user['id']]);
        ok(null, '更新成功');
        break;

    default:
        fail('未知操作');
}
} catch (PDOException $e) {
    fail('数据库错误: ' . $e->getMessage(), 500);
}

<?php
// 项目接口: projects.php / projects.php?id=1 / projects.php?action=create
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $cat = $_GET['category'] ?? '';
        $sql = 'SELECT p.*, (SELECT COUNT(*) FROM submissions s WHERE s.project_id = p.id) AS acceptCount FROM projects p';
        if ($cat) {
            $stmt = $pdo->prepare($sql . ' WHERE p.category = ? ORDER BY p.id DESC');
            $stmt->execute([$cat]);
        } else {
            $stmt = $pdo->query($sql . ' ORDER BY p.id DESC');
        }
        ok($stmt->fetchAll());
        break;

    case 'detail':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare('SELECT p.*, (SELECT COUNT(*) FROM submissions s WHERE s.project_id = p.id) AS acceptCount FROM projects p WHERE p.id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) fail('项目不存在', 404);
        ok($row);
        break;

    case 'create':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $data = input();
        $title = trim($data['title'] ?? '');
        if (!$title) fail('标题不能为空');
        $stmt = $pdo->prepare('INSERT INTO projects (title, description, category) VALUES (?, ?, ?)');
        $stmt->execute([$title, $data['description'] ?? '', $data['category'] ?? '照片修复']);
        ok(['id' => (int)$pdo->lastInsertId()], '创建成功');
        break;

    // 获取当前用户已接单(有提交)的项目
    case 'myProjects':
        $user = checkLogin();
        $stmt = $pdo->prepare(
            'SELECT DISTINCT p.id, p.title, p.description, p.category, p.status,
                    (SELECT COUNT(*) FROM submissions s2 WHERE s2.project_id = p.id) AS acceptCount
             FROM projects p INNER JOIN submissions s ON s.project_id = p.id
             WHERE s.user_id = ? ORDER BY p.id DESC'
        );
        $stmt->execute([$user['id']]);
        ok($stmt->fetchAll());
        break;

    // 删除项目 (仅管理员)
    case 'delete':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $id = $_GET['id'] ?? 0;
        if (!$id) fail('缺少项目ID');
        $stmt = $pdo->prepare('SELECT id FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) fail('项目不存在', 404);
        $pdo->prepare('DELETE FROM projects WHERE id = ?')->execute([$id]);
        ok(null, '删除成功');
        break;

    // 公开统计接口 (无需登录，首页和管理端共用)
    case 'stats':
        $photos = $pdo->query("SELECT COUNT(*) FROM submissions s JOIN projects p ON s.project_id = p.id WHERE s.review_status = '通过' AND p.category = '照片修复'")->fetchColumn();
        $volunteers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'volunteer'")->fetchColumn();
        $martyrs = $pdo->query("SELECT COUNT(*) FROM martyrs")->fetchColumn();
        ok(['photos' => (int)$photos, 'volunteers' => (int)$volunteers, 'martyrs' => (int)$martyrs]);
        break;

    default:
        fail('未知操作');
}

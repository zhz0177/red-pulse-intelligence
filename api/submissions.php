<?php
// 提交接口: submissions.php?project_id=1 / action=submit / action=review / action=my
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $pid = $_GET['project_id'] ?? 0;
        $stmt = $pdo->prepare(
            'SELECT s.*, u.username,
             (SELECT JSON_OBJECT("rating", f.rating, "comment", f.comment) FROM feedbacks f WHERE f.submission_id = s.id LIMIT 1) AS feedback
             FROM submissions s LEFT JOIN users u ON s.user_id = u.id
             WHERE s.project_id = ? ORDER BY s.created_at DESC'
        );
        $stmt->execute([$pid]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['feedback'] = $r['feedback'] ? json_decode($r['feedback'], true) : null;
        }
        ok($rows);
        break;

    case 'submit':
        $user = checkLogin();
        $data = input();
        $pid = $data['project_id'] ?? 0;
        $insight = trim($data['insight'] ?? '');
        if (!$insight) fail('志愿心得不能为空');

        $stmt = $pdo->prepare('INSERT INTO submissions (project_id, user_id, work_url, insight) VALUES (?, ?, ?, ?)');
        $stmt->execute([$pid, $user['id'], $data['work_url'] ?? '', $insight]);
        ok(['id' => (int)$pdo->lastInsertId()], '提交成功');
        break;

    case 'review':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $data = input();
        $id = $data['id'] ?? 0;
        $status = $data['status'] ?? '';
        if (!in_array($status, ['通过', '驳回'])) fail('无效状态');

        $code = '';
        $reason = trim($data['reject_reason'] ?? '');
        if ($status === '通过') {
            $code = 'HM' . strtoupper(base_convert(time(), 10, 36)) . strtoupper(substr(md5($id . time()), 0, 4));
            $reason = '';
        }
        $stmt = $pdo->prepare('UPDATE submissions SET review_status = ?, certificate_code = ?, reject_reason = ? WHERE id = ?');
        $stmt->execute([$status, $code, $reason, $id]);

        // 审核通过奖励 30 传承豆
        if ($status === '通过') {
            $stmt = $pdo->prepare('SELECT user_id FROM submissions WHERE id = ?');
            $stmt->execute([$id]);
            $sub = $stmt->fetch();
            if ($sub) {
                try { addBeans((int)$sub['user_id'], 30, '志愿项目审核通过奖励'); } catch (Exception $e) {}
            }
        }

        ok(['certificate_code' => $code], '审核完成');
        break;

    // 获取当前用户的所有提交（含项目名、审核状态、驳回意见、证书码）
    case 'my':
        $user = checkLogin();
        $stmt = $pdo->prepare(
            'SELECT s.id, s.project_id, s.insight, s.review_status AS reviewStatus,
                    s.certificate_code AS certificateCode, s.reject_reason AS rejectReason,
                    s.created_at AS createdAt, p.title AS projectTitle, p.category
             FROM submissions s LEFT JOIN projects p ON s.project_id = p.id
             WHERE s.user_id = ? ORDER BY s.created_at DESC'
        );
        $stmt->execute([$user['id']]);
        ok($stmt->fetchAll());
        break;

    default:
        fail('未知操作');
}

<?php
// 红色知识答题 API
// quiz.php?action=question|answer|score|leaderboard|list|create|update|delete
require_once __DIR__ . '/config.php';

// 自动建表（首次调用时）
try {
    $pdo->query("SELECT 1 FROM quiz_questions LIMIT 1");
} catch (Exception $e) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `quiz_questions` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `question` TEXT NOT NULL,
            `option_a` VARCHAR(500) NOT NULL,
            `option_b` VARCHAR(500) NOT NULL,
            `option_c` VARCHAR(500) NOT NULL,
            `option_d` VARCHAR(500) NOT NULL,
            `answer` CHAR(1) NOT NULL COMMENT 'A/B/C/D',
            `category` VARCHAR(50) DEFAULT '红色历史',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `quiz_scores` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `streak` INT UNSIGNED NOT NULL DEFAULT 0,
            `total_time` INT UNSIGNED DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 种子题库（30 道红色历史选择题）
    $seed = [
        ['赵一曼烈士在就义前给谁写了遗书？','丈夫陈达邦','儿子宁儿','母亲','战友','B','革命先烈'],
        ['杨靖宇将军牺牲后，日军解剖遗体发现其胃中只有什么？','玉米','野菜','草根、树皮和棉絮','米饭','C','革命先烈'],
        ['毛主席为哪位烈士题词"生的伟大，死的光荣"？','赵一曼','刘胡兰','江竹筠','向警予','B','革命先烈'],
        ['黄继光烈士在哪场战役中壮烈牺牲？','长津湖战役','上甘岭战役','百团大战','台儿庄战役','B','抗美援朝'],
        ['邱少云烈士牺牲于哪场战斗？','上甘岭战役','391高地反击战','长津湖战役','金城战役','B','抗美援朝'],
        ['董存瑞牺牲时高喊的口号是什么？','冲啊！','为了新中国，前进！','为人民服务','打倒反动派','B','解放战争'],
        ['左权将军是抗日战争中八路军牺牲的最高将领，他的职务是？','师长','副总司令','副参谋长','政治委员','C','抗日战争'],
        ['江竹筠被关押在重庆哪个监狱？','白公馆','渣滓洞','息烽集中营','上饶集中营','B','革命先烈'],
        ['毛主席的《为人民服务》演讲是在谁的追悼会上发表的？','张思德','白求恩','刘胡兰','雷锋','A','革命先烈'],
        ['狼牙山五壮士跳崖后，幸存的两位壮士是谁？','马宝玉、葛振林','葛振林、宋学义','胡德林、胡福才','宋学义、马宝玉','B','抗日战争'],
        ['方志敏在狱中写下的著名文章是？','《论持久战》','《可爱的中国》','《新民主主义论》','《实践论》','B','革命先烈'],
        ['中国共产党主要创始人之一，将马克思主义引入中国的先驱是？','陈独秀','李大钊','毛泽东','周恩来','B','党史知识'],
        ['最早提出建立"中国共产党"名称的人是？','李大钊','陈独秀','蔡和森','毛泽东','C','党史知识'],
        ['叶挺将军在狱中写下的著名诗歌是？','《囚歌》','《就义诗》','《梅岭三章》','《狱中诗》','A','革命先烈'],
        ['谢晋元率领"八百壮士"坚守的是哪座建筑？','南京总统府','上海四行仓库','武汉国民政府','广州黄花岗','B','抗日战争'],
        ['夏明翰就义诗的最后一句是什么？','革命一定胜利','还有后来人','主义永不灭','薪火代代传','B','革命先烈'],
        ['中国共产党第一位牺牲在战斗前线的中央委员是谁？','张太雷','瞿秋白','向警予','蔡和森','A','党史知识'],
        ['被毛主席誉为"农民运动大王"的是谁？','韦拔群','彭湃','方志敏','刘志丹','B','革命先烈'],
        ['百色起义的领导人之一，被誉为"广西农民运动的旗帜"的是？','韦拔群','邓小平','张云逸','李明瑞','A','革命先烈'],
        ['红军史上最年轻的军团长是谁？','林彪','寻淮洲','粟裕','陈赓','B','革命先烈'],
        ['陈延年在被捕后留下了什么铮铮誓言？','生当作人杰','革命者只有站着死，绝不跪下','砍头不要紧','宁死不屈','B','革命先烈'],
        ['瞿秋白主持的挽救革命的重要会议是？','遵义会议','八七会议','古田会议','中共六大','B','党史知识'],
        ['与杨靖宇齐名并称"南杨北赵"的抗联将领是？','赵尚志','赵一曼','赵世炎','赵登禹','A','抗日战争'],
        ['刘志丹创建的革命根据地为中央红军长征提供了落脚点，这个根据地在？','井冈山','陕甘边','大别山','太行山','B','革命先烈'],
        ['中国共产党成立于哪一年？','1919年','1920年','1921年','1922年','C','党史知识'],
        ['南昌起义发生在哪一年？','1926年','1927年','1928年','1929年','B','党史知识'],
        ['抗日战争中八路军发动的大规模进攻战是？','平型关大捷','百团大战','台儿庄战役','武汉会战','B','抗日战争'],
        ['红军长征途中召开的转折性会议是？','八七会议','古田会议','遵义会议','瓦窑堡会议','C','党史知识'],
        ['中华人民共和国成立于哪一年？','1948年','1949年','1950年','1951年','B','党史知识'],
        ['戴安兰将军率领的中国远征军在哪个国家作战？','越南','缅甸','朝鲜','印度','B','抗日战争'],
    ];
    $stmt = $pdo->prepare('INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, answer, category) VALUES (?,?,?,?,?,?,?)');
    foreach ($seed as $q) {
        $stmt->execute($q);
    }
}

$action = $_GET['action'] ?? '';

switch ($action) {

    // === 用户端：获取随机题目 ===
    case 'question':
        $user = checkLogin();
        $exclude = $_GET['exclude'] ?? '';
        $excludeIds = array_filter(array_map('intval', explode(',', $exclude)));

        if (count($excludeIds)) {
            $placeholders = implode(',', array_fill(0, count($excludeIds), '?'));
            $stmt = $pdo->prepare("SELECT id, question, option_a, option_b, option_c, option_d, category FROM quiz_questions WHERE id NOT IN ($placeholders) ORDER BY RAND() LIMIT 1");
            $stmt->execute($excludeIds);
        } else {
            $stmt = $pdo->query('SELECT id, question, option_a, option_b, option_c, option_d, category FROM quiz_questions ORDER BY RAND() LIMIT 1');
        }
        $q = $stmt->fetch();
        if (!$q) fail('题库已答完，恭喜你！');
        ok($q);
        break;

    // === 用户端：提交答案（后端校验防作弊）===
    case 'answer':
        $user = checkLogin();
        $data = input();
        $qid = (int)($data['question_id'] ?? 0);
        $ans = strtoupper(trim($data['answer'] ?? ''));
        if (!$qid || !in_array($ans, ['A','B','C','D'])) fail('参数错误');

        $stmt = $pdo->prepare('SELECT answer FROM quiz_questions WHERE id = ?');
        $stmt->execute([$qid]);
        $row = $stmt->fetch();
        if (!$row) fail('题目不存在');

        $correct = $row['answer'] === $ans;
        if ($correct) {
            try { addBeans($user['id'], 2, '答题正确奖励'); } catch (Exception $e) {}
        }
        ok(['correct' => $correct, 'correct_answer' => $row['answer'], 'beans_earned' => $correct ? 2 : 0]);
        break;

    // === 用户端：提交分数（同一用户只保留历史最高分）===
    case 'score':
        $user = checkLogin();
        $data = input();
        $streak = (int)($data['streak'] ?? 0);
        $totalTime = (int)($data['total_time'] ?? 0);
        if ($streak < 0) $streak = 0;

        $stmt = $pdo->prepare('SELECT id, streak FROM quiz_scores WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($streak > (int)$existing['streak']) {
                $stmt = $pdo->prepare('UPDATE quiz_scores SET streak = ?, total_time = ?, created_at = NOW() WHERE id = ?');
                $stmt->execute([$streak, $totalTime, $existing['id']]);
                ok(null, '新纪录！成绩已更新');
            } else {
                ok(null, '成绩已记录（未超过历史最高）');
            }
        } else {
            $stmt = $pdo->prepare('INSERT INTO quiz_scores (user_id, streak, total_time) VALUES (?, ?, ?)');
            $stmt->execute([$user['id'], $streak, $totalTime]);
            ok(null, '成绩已记录');
        }
        break;

    // === 用户端：排行榜（每用户只取最高分）===
    case 'leaderboard':
        checkLogin();
        $stmt = $pdo->query("
            SELECT MAX(qs.streak) AS streak,
                   MIN(qs.total_time) AS total_time,
                   MAX(qs.created_at) AS created_at,
                   u.username
            FROM quiz_scores qs
            JOIN users u ON qs.user_id = u.id
            GROUP BY qs.user_id, u.username
            ORDER BY streak DESC, total_time ASC, created_at ASC
            LIMIT 50
        ");
        ok($stmt->fetchAll());
        break;

    // === 用户端：获取自己的最高分 ===
    case 'myscore':
        $user = checkLogin();
        $stmt = $pdo->prepare('SELECT MAX(streak) AS best_streak FROM quiz_scores WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();
        ok(['best_streak' => (int)($row['best_streak'] ?? 0)]);
        break;

    // === 管理端：题目列表 ===
    case 'list':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $rows = $pdo->query('SELECT * FROM quiz_questions ORDER BY id DESC')->fetchAll();
        ok($rows);
        break;

    // === 管理端：创建题目 ===
    case 'create':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $data = input();
        $q = trim($data['question'] ?? '');
        $a = trim($data['option_a'] ?? '');
        $b = trim($data['option_b'] ?? '');
        $c = trim($data['option_c'] ?? '');
        $d = trim($data['option_d'] ?? '');
        $ans = strtoupper(trim($data['answer'] ?? ''));
        $cat = trim($data['category'] ?? '红色历史');
        if (!$q || !$a || !$b || !$c || !$d) fail('题干和选项不能为空');
        if (!in_array($ans, ['A','B','C','D'])) fail('正确答案必须是A/B/C/D');

        $stmt = $pdo->prepare('INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, answer, category) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([$q, $a, $b, $c, $d, $ans, $cat]);
        ok(['id' => (int)$pdo->lastInsertId()], '创建成功');
        break;

    // === 管理端：更新题目 ===
    case 'update':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $data = input();
        $id = (int)($data['id'] ?? 0);
        if (!$id) fail('缺少题目ID');

        $stmt = $pdo->prepare('SELECT * FROM quiz_questions WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) fail('题目不存在', 404);

        $q = trim($data['question'] ?? '');
        $a = trim($data['option_a'] ?? '');
        $b = trim($data['option_b'] ?? '');
        $c = trim($data['option_c'] ?? '');
        $d = trim($data['option_d'] ?? '');
        $ans = strtoupper(trim($data['answer'] ?? ''));
        $cat = trim($data['category'] ?? '红色历史');
        if (!$q || !$a || !$b || !$c || !$d) fail('题干和选项不能为空');
        if (!in_array($ans, ['A','B','C','D'])) fail('正确答案必须是A/B/C/D');

        $stmt = $pdo->prepare('UPDATE quiz_questions SET question=?, option_a=?, option_b=?, option_c=?, option_d=?, answer=?, category=? WHERE id=?');
        $stmt->execute([$q, $a, $b, $c, $d, $ans, $cat, $id]);
        ok(null, '更新成功');
        break;

    // === 管理端：删除题目 ===
    case 'delete':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) fail('缺少题目ID');
        $pdo->prepare('DELETE FROM quiz_questions WHERE id = ?')->execute([$id]);
        ok(null, '删除成功');
        break;

    // === 管理端：删除用户成绩 ===
    case 'deleteScore':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) fail('缺少成绩ID');
        $pdo->prepare('DELETE FROM quiz_scores WHERE id = ?')->execute([$id]);
        ok(null, '成绩已删除');
        break;

    // === 管理端：排行榜（含记录ID，用于删除）===
    case 'adminLeaderboard':
        $user = checkLogin();
        if ($user['role'] !== 'admin') fail('无权限', 403);
        $stmt = $pdo->query("
            SELECT qs.id, qs.streak, qs.total_time, qs.created_at, u.username, u.id AS user_id
            FROM quiz_scores qs
            JOIN users u ON qs.user_id = u.id
            ORDER BY qs.streak DESC, qs.total_time ASC, qs.created_at ASC
        ");
        ok($stmt->fetchAll());
        break;

    default:
        fail('未知操作');
}

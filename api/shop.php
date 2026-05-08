<?php
// 传承商城 API
// shop.php?action=items|buy|inventory|balance|equip|costume|reset-costume|use-item|earn
require_once __DIR__ . '/config.php';

// 自动建表（首次调用时）
try {
    $pdo->query("SELECT 1 FROM shop_items LIMIT 1");
} catch (Exception $e) {
    // 给 users 表加 beans 字段
    try {
        $pdo->query("SELECT beans FROM users LIMIT 1");
    } catch (Exception $e2) {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `beans` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `wechat`");
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `shop_items` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `category` ENUM('costume','game_item') NOT NULL,
            `sub_category` VARCHAR(50) DEFAULT '',
            `price` INT UNSIGNED NOT NULL DEFAULT 0,
            `css_class` VARCHAR(100) DEFAULT '',
            `description` TEXT,
            `icon` VARCHAR(50) DEFAULT '',
            `sort_order` INT UNSIGNED DEFAULT 0,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `user_inventory` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `item_id` INT UNSIGNED NOT NULL,
            `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
            `purchased_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `uk_user_item` (`user_id`, `item_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `user_costume` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL UNIQUE,
            `head_item_id` INT UNSIGNED DEFAULT NULL,
            `body_item_id` INT UNSIGNED DEFAULT NULL,
            `accessory_item_id` INT UNSIGNED DEFAULT NULL,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS `bean_transactions` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `amount` INT NOT NULL,
            `reason` VARCHAR(100) NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 种子商品
    $items = [
        ['小红军套装','costume','body',80,'costume-red-army','经典红军战士装扮，灰色军装配红星帽','🎖',1],
        ['红领巾','costume','accessory',30,'costume-red-scarf','鲜艳的红领巾，少先队员的标志','🔴',2],
        ['复古帽','costume','head',50,'costume-retro-hat','复古军帽，致敬革命年代','🧢',3],
        ['志愿者马甲','costume','body',60,'costume-volunteer-vest','红色志愿者马甲，传承服务精神','🦺',4],
        ['五角星徽章','costume','accessory',40,'costume-star-badge','闪亮的五角星胸章','⭐',5],
        ['红色围巾','costume','accessory',35,'costume-red-wrap','温暖的红色围巾','🧣',6],
        ['题目答案提示卡','game_item','hint',20,'','答题时排除一个错误选项','💡',10],
        ['错题免错卡','game_item','shield',30,'','答错一次不结束游戏','🛡',11],
        ['游戏翻倍卡','game_item','multiplier',25,'','本局获得的传承豆翻倍','✨',12],
    ];
    $stmt = $pdo->prepare('INSERT INTO shop_items (name,category,sub_category,price,css_class,description,icon,sort_order) VALUES (?,?,?,?,?,?,?,?)');
    foreach ($items as $item) {
        $stmt->execute($item);
    }
}

$action = $_GET['action'] ?? '';

switch ($action) {

    // 获取商品列表
    case 'items':
        checkLogin();
        $rows = $pdo->query('SELECT id, name, category, sub_category, price, css_class, description, icon FROM shop_items ORDER BY sort_order')->fetchAll();
        ok($rows);
        break;

    // 购买商品
    case 'buy':
        $user = checkLogin();
        $data = input();
        $itemId = (int)($data['item_id'] ?? 0);
        if (!$itemId) fail('缺少商品ID');

        $stmt = $pdo->prepare('SELECT * FROM shop_items WHERE id = ?');
        $stmt->execute([$itemId]);
        $item = $stmt->fetch();
        if (!$item) fail('商品不存在');

        // 装扮类不可重复购买
        if ($item['category'] === 'costume') {
            $stmt = $pdo->prepare('SELECT id FROM user_inventory WHERE user_id = ? AND item_id = ?');
            $stmt->execute([$user['id'], $itemId]);
            if ($stmt->fetch()) fail('你已经拥有该装扮');
        }

        // 检查余额
        $stmt = $pdo->prepare('SELECT beans FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $balance = (int)$stmt->fetchColumn();
        if ($balance < $item['price']) fail('传承豆不足，还需要 ' . ($item['price'] - $balance) . ' 豆');

        // 事务：扣豆 + 入库
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('UPDATE users SET beans = beans - ? WHERE id = ? AND beans >= ?');
            $stmt->execute([$item['price'], $user['id'], $item['price']]);
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                fail('传承豆不足');
            }

            $stmt = $pdo->prepare('INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1');
            $stmt->execute([$user['id'], $itemId]);

            $pdo->prepare('INSERT INTO bean_transactions (user_id, amount, reason) VALUES (?, ?, ?)')->execute([
                $user['id'], -$item['price'], '购买：' . $item['name']
            ]);

            $pdo->commit();
        } catch (Exception $ex) {
            $pdo->rollBack();
            fail('购买失败，请重试');
        }

        $stmt = $pdo->prepare('SELECT beans FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        $newBalance = (int)$stmt->fetchColumn();
        ok(['beans' => $newBalance], '购买成功！');
        break;

    // 获取用户背包
    case 'inventory':
        $user = checkLogin();
        $stmt = $pdo->prepare('
            SELECT ui.item_id, ui.quantity, si.name, si.category, si.sub_category, si.css_class, si.description, si.icon, si.price
            FROM user_inventory ui
            JOIN shop_items si ON ui.item_id = si.id
            WHERE ui.user_id = ?
            ORDER BY si.sort_order
        ');
        $stmt->execute([$user['id']]);
        ok($stmt->fetchAll());
        break;

    // 获取传承豆余额
    case 'balance':
        $user = checkLogin();
        $stmt = $pdo->prepare('SELECT beans FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        ok(['beans' => (int)$stmt->fetchColumn()]);
        break;

    // 保存装扮
    case 'equip':
        $user = checkLogin();
        $data = input();
        $head = $data['head_item_id'] ? (int)$data['head_item_id'] : null;
        $body = $data['body_item_id'] ? (int)$data['body_item_id'] : null;
        $accessory = $data['accessory_item_id'] ? (int)$data['accessory_item_id'] : null;

        // 验证用户拥有这些物品
        $toCheck = array_filter([$head, $body, $accessory]);
        if (count($toCheck)) {
            $placeholders = implode(',', array_fill(0, count($toCheck), '?'));
            $stmt = $pdo->prepare("SELECT item_id FROM user_inventory WHERE user_id = ? AND item_id IN ($placeholders)");
            $stmt->execute(array_merge([$user['id']], $toCheck));
            $owned = array_column($stmt->fetchAll(), 'item_id');
            foreach ($toCheck as $id) {
                if (!in_array($id, $owned)) fail('你未拥有该装扮');
            }
        }

        $stmt = $pdo->prepare('INSERT INTO user_costume (user_id, head_item_id, body_item_id, accessory_item_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE head_item_id = VALUES(head_item_id), body_item_id = VALUES(body_item_id), accessory_item_id = VALUES(accessory_item_id)');
        $stmt->execute([$user['id'], $head, $body, $accessory]);
        ok(null, '装扮已保存');
        break;

    // 获取当前装扮
    case 'costume':
        $user = checkLogin();
        $stmt = $pdo->prepare('
            SELECT uc.head_item_id, uc.body_item_id, uc.accessory_item_id,
                   h.css_class AS head_css, b.css_class AS body_css, a.css_class AS accessory_css
            FROM user_costume uc
            LEFT JOIN shop_items h ON uc.head_item_id = h.id
            LEFT JOIN shop_items b ON uc.body_item_id = b.id
            LEFT JOIN shop_items a ON uc.accessory_item_id = a.id
            WHERE uc.user_id = ?
        ');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();
        ok($row ?: ['head_item_id' => null, 'body_item_id' => null, 'accessory_item_id' => null, 'head_css' => null, 'body_css' => null, 'accessory_css' => null]);
        break;

    // 重置装扮
    case 'reset-costume':
        $user = checkLogin();
        $pdo->prepare('DELETE FROM user_costume WHERE user_id = ?')->execute([$user['id']]);
        ok(null, '已恢复默认形象');
        break;

    // 使用游戏道具
    case 'use-item':
        $user = checkLogin();
        $data = input();
        $itemId = (int)($data['item_id'] ?? 0);
        if (!$itemId) fail('缺少道具ID');

        $stmt = $pdo->prepare('SELECT ui.quantity, si.name, si.category FROM user_inventory ui JOIN shop_items si ON ui.item_id = si.id WHERE ui.user_id = ? AND ui.item_id = ?');
        $stmt->execute([$user['id'], $itemId]);
        $row = $stmt->fetch();
        if (!$row) fail('你没有该道具');
        if ($row['category'] !== 'game_item') fail('该物品不是游戏道具');
        if ($row['quantity'] <= 0) fail('道具数量不足');

        if ($row['quantity'] === 1) {
            $pdo->prepare('DELETE FROM user_inventory WHERE user_id = ? AND item_id = ?')->execute([$user['id'], $itemId]);
        } else {
            $pdo->prepare('UPDATE user_inventory SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?')->execute([$user['id'], $itemId]);
        }
        ok(['remaining' => max(0, $row['quantity'] - 1)], $row['name'] . ' 使用成功');
        break;

    // 游戏完成奖励
    case 'earn':
        $user = checkLogin();
        $data = input();
        $reason = trim($data['reason'] ?? '');
        // 传承豆奖励类型（前端按行为触发）
        $allowed = [
            // 红迹地图 → 提交家书
            'letter_reply' => ['amount' => 20, 'label' => '提交家书'],

            // 百题斩 → 每答对一题
            'quiz_correct' => ['amount' => 2, 'label' => '百题斩答对'],
            'quiz_correct_double' => ['amount' => 4, 'label' => '百题斩答对（翻倍）'],

            // 翻翻乐 → 完成一局
            'memory_game' => ['amount' => 15, 'label' => '翻翻乐通关'],
            'memory_game_double' => ['amount' => 30, 'label' => '翻翻乐通关（翻倍）'],

            // 抉择时刻 → 完成一次抉择
            'choice_game' => ['amount' => 10, 'label' => '抉择时刻通关'],
            'choice_game_double' => ['amount' => 20, 'label' => '抉择时刻通关（翻倍）'],

            // 接单平台 → 完成接单
            'volunteer_complete' => ['amount' => 30, 'label' => '接单平台完成'],
            'volunteer_complete_double' => ['amount' => 60, 'label' => '接单平台完成（翻倍）'],

            // 勋章系统 → 点亮一枚勋章
            'medal_light' => ['amount' => 50, 'label' => '勋章点亮'],
        ];
        if (!isset($allowed[$reason])) fail('无效的奖励类型');

        addBeans($user['id'], $allowed[$reason]['amount'], $allowed[$reason]['label']);

        $stmt = $pdo->prepare('SELECT beans FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
        ok(['beans' => (int)$stmt->fetchColumn(), 'earned' => $allowed[$reason]['amount']], '+' . $allowed[$reason]['amount'] . ' 传承豆');
        break;

    default:
        fail('未知操作');
}

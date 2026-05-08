<?php
// 文件上传接口
require_once __DIR__ . '/config.php';

$user = checkLogin();

if (empty($_FILES['file'])) fail('没有上传文件');

$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4'];

if (!in_array($ext, $allowed)) fail('不支持的文件类型');
if ($file['size'] > 10 * 1024 * 1024) fail('文件不能超过10MB');

$dir = __DIR__ . '/uploads/' . date('Ym');
if (!is_dir($dir)) mkdir($dir, 0755, true);

$name = time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
$path = $dir . '/' . $name;

if (move_uploaded_file($file['tmp_name'], $path)) {
    ok(['url' => '/api/uploads/' . date('Ym') . '/' . $name]);
} else {
    fail('上传失败');
}

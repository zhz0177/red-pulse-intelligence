# Red Pulse - 红脉智联

> 一个红色文化教育平台，通过数字化手段传承革命精神，让红色基因代代相传。

## 项目简介

红脉智联是一个集烈士纪念、红色教育、志愿服务于一体的综合性平台。平台收录了众多革命先烈的生平事迹、革命轨迹和珍贵家书，通过地图可视化、AI对话、知识竞答等多种形式，让红色文化教育更加生动有趣。

## 功能特性

### 烈士纪念馆
- 展示革命先烈生平事迹与照片
- 高德地图可视化展示烈士革命轨迹
- 珍贵家书展示与AI智能解读

### AI 智能助手
- 集成豆包AI，提供红色文化智能问答
- 支持家书内容智能解读与翻译

### 知识竞答
- 红色文化知识测验
- 答题积分奖励机制

### 志愿服务
- 志愿任务发布与管理
- 任务提交与审核
- 红豆积分系统

### 积分商城
- 红豆积分兑换商品
- 虚拟装扮系统

### 后台管理
- 用户管理
- 项目管理
- 题库管理
- 数据统计面板

## 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI**: Tailwind CSS
- **可视化**: ECharts
- **地图**: 高德地图 JS API
- **其他**: Swiper、html2canvas、jsPDF

### 后端
- **语言**: PHP
- **数据库**: MySQL
- **AI服务**: 豆包大模型 API

## 项目结构

```
red-pulse/
├── api/                    # PHP后端API
│   ├── config.php         # 数据库配置
│   ├── init.sql           # 数据库初始化脚本
│   ├── auth.php           # 用户认证
│   ├── martyrs.php        # 烈士数据接口
│   ├── letters.php        # 家书接口
│   ├── quiz.php           # 知识竞答接口
│   ├── shop.php           # 商城接口
│   ├── projects.php       # 项目接口
│   ├── admin.php          # 管理后台接口
│   ├── ai.php             # AI对话接口
│   └── doubao.php         # 豆包AI封装
├── frontend/              # Vue前端项目
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── components/    # 公共组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia状态管理
│   │   ├── api/           # API请求封装
│   │   └── assets/        # 静态资源
│   ├── package.json
│   └── vite.config.js
└── photo/                 # 烈士照片资源
    ├── zhao_yiman/
    ├── yang_jingyu/
    └── ...
```

## 快速开始

### 环境要求

- Node.js >= 18
- PHP >= 7.4
- MySQL >= 5.7
- Composer (可选)

### 1. 数据库初始化

```bash
# 登录MySQL，执行初始化脚本
mysql -u root -p < api/init.sql
```

### 2. 配置后端

编辑 `api/config.php`，修改数据库连接信息：

```php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'red-pulse';
$DB_USER = 'your_username';
$DB_PASS = 'your_password';
```

### 3. 启动后端

使用 PHP 内置服务器或配置 Nginx/Apache：

```bash
cd api
php -S localhost:8000
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173 即可查看项目。

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 志愿者 | 张晓明 | 123456 |

## 部署说明

### 前端部署

```bash
cd frontend
npm run build
```

将 `dist` 目录部署到 Web 服务器。

### 后端部署

1. 将 `api` 目录上传至服务器
2. 配置 Nginx 或 Apache 指向 `api` 目录
3. 确保 PHP 已启用 PDO MySQL 扩展
4. 修改 `config.php` 中的数据库配置和 API Key

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        alias /path/to/api/;
        rewrite ^/api/(.*)$ /$1 break;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 开源协议

MIT License

## 致谢

- 感谢所有为民族独立和人民解放事业英勇献身的革命先烈
- 感谢豆包AI提供智能对话服务
- 感谢高德地图提供地图服务

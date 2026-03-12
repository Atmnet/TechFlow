# TechFlow Backend POC

基于 WebContainers API 的 K8s YAML 验证沙盒系统

## 🚀 技术栈

- **Runtime**: Node.js 20
- **Framework**: Fastify 4
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Sandbox**: WebContainers API
- **Container**: Docker + Docker Compose

## 📦 快速开始

### 环境要求

- Node.js >= 20.0.0
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 本地开发

```bash
# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 启动数据库和 Redis（Docker）
docker-compose up -d db redis

# 启动开发服务器
npm run dev
```

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

## 📡 API 文档

### 健康检查

```bash
# 存活检查
GET /api/health/live

# 就绪检查
GET /api/health/ready

# 指标
GET /api/health/metrics
```

### 沙盒管理

```bash
# 启动沙盒
POST /api/sandbox/start
Response: { success: true, startupTime: 1500, target: "达标" }

# 执行命令
POST /api/sandbox/execute
Body: { command: "kubectl", args: ["version"] }

# 查看状态
GET /api/sandbox/status

# 关闭沙盒
POST /api/sandbox/stop
```

### YAML 验证

```bash
# 单个验证
POST /api/validation/validate
Body: { yaml: "apiVersion: v1\nkind: Pod\n..." }

# 批量验证
POST /api/validation/validate-batch
Body: { yamls: ["...", "..."] }
```

## ✅ 验收标准

| 指标 | 目标 | 当前状态 |
|------|------|----------|
| 沙盒启动时间 | < 2 秒 | 待测试 |
| kubectl 执行 | 正常 | 待测试 |
| YAML 验证准确率 | > 95% | 待测试 |
| 输出延迟 | < 100ms | 待测试 |

## 📁 项目结构

```
backend-poc/
├── src/
│   ├── app.js              # 应用入口
│   ├── api/
│   │   ├── health.js       # 健康检查 API
│   │   ├── webcontainer.js # 沙盒 API
│   │   └── validation.js   # YAML 验证 API
│   ├── config/             # 配置文件
│   ├── db/                 # 数据库相关
│   ├── middleware/         # 中间件
│   ├── services/           # 业务服务
│   └── utils/              # 工具函数
├── docker-compose.yml      # Docker 编排
├── Dockerfile              # Docker 镜像
├── init-db.sql            # 数据库初始化
├── package.json
└── .env.example
```

## 🔒 安全考虑

- JWT 认证授权
- Helmet 安全头
- CORS 配置
- 输入验证（Zod）
- 非 root 用户运行
- 健康检查

## 📊 性能优化

- Redis 缓存
- 数据库连接池
- 沙盒实例复用
- 异步处理

## 🧪 测试

```bash
# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 📝 License

MIT

# TechFlow 技术方案文档

**版本**: 1.0.0  
**创建日期**: 2026-03-11  
**最后更新**: 2026-03-11  
**作者**: TechFlow 后端开发团队

---

## 目录

1. [系统架构](#1-系统架构)
2. [后端技术方案](#2-后端技术方案)
3. [部署方案](#3-部署方案)
4. [附录](#4-附录)

---

## 1. 系统架构

### 1.1 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web 端     │  │   移动端    │  │   API 调用   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ HTTPS
┌──────────────────────────┼──────────────────────────────────────┐
│                    API 网关层                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Fastify Server (Node.js 20)                 │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │   │
│  │  │  认证中间件  │ │  限流中间件  │ │  日志中间件  │        │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬─────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    业务服务层                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  沙盒服务     │  │  验证服务     │  │  用户服务     │         │
│  │  (Sandbox)   │  │ (Validation) │  │   (User)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼──────────────────┐
│                    数据层                                       │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐        │
│  │  PostgreSQL  │  │    Redis     │  │  文件系统     │        │
│  │  (持久化)    │  │   (缓存)     │  │  (临时)      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 技术选型 | 用途 |
|------|----------|------|
| Web 服务器 | Fastify 4 | API 服务 |
| 运行时 | Node.js 20 | JavaScript 运行时 |
| 沙盒引擎 | WebContainers API | K8s YAML 验证 |
| 主数据库 | PostgreSQL 15 | 持久化存储 |
| 缓存 | Redis 7 | 会话/缓存 |
| 容器化 | Docker + Compose | 部署封装 |
| 编排 | Kubernetes (P2) | 生产环境 |

### 1.3 数据流

```
用户请求 → API 网关 → 认证验证 → 业务处理 → 数据访问 → 响应返回
                ↓           ↓           ↓
            日志记录    缓存查询    数据库操作
```

---

## 2. 后端技术方案

### 2.1 API 设计（RESTful）

#### 2.1.1 设计规范

- **基础路径**: `/api/v1`
- **认证**: Bearer Token (JWT)
- **格式**: JSON (UTF-8)
- **版本控制**: URL 路径版本

#### 2.1.2 端点列表

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/health/live` | 存活检查 | ❌ |
| GET | `/health/ready` | 就绪检查 | ❌ |
| POST | `/auth/login` | 用户登录 | ❌ |
| POST | `/auth/register` | 用户注册 | ❌ |
| POST | `/sandbox/start` | 启动沙盒 | ✅ |
| POST | `/sandbox/execute` | 执行命令 | ✅ |
| GET | `/sandbox/status` | 沙盒状态 | ✅ |
| POST | `/sandbox/stop` | 关闭沙盒 | ✅ |
| POST | `/validation/validate` | 验证 YAML | ✅ |
| POST | `/validation/validate-batch` | 批量验证 | ✅ |
| GET | `/projects` | 获取项目列表 | ✅ |
| POST | `/projects` | 创建项目 | ✅ |
| GET | `/projects/:id` | 获取项目详情 | ✅ |
| PUT | `/projects/:id` | 更新项目 | ✅ |
| DELETE | `/projects/:id` | 删除项目 | ✅ |

#### 2.1.3 响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-11T09:28:00.000Z"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "YAML 格式错误",
    "details": [...]
  },
  "timestamp": "2026-03-11T09:28:00.000Z"
}
```

#### 2.1.4 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 429 | Too Many Requests | 请求超限 |
| 500 | Internal Server Error | 服务器错误 |

---

### 2.2 数据库表结构

#### 2.2.1 ER 图

```
┌─────────────┐       ┌─────────────┐
│    users    │       │   projects  │
├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ owner_id    │
│ username    │       │ id (PK)     │
│ email       │       │ name        │
│ password    │       │ description │
│ role        │       │ created_at  │
│ created_at  │       │ updated_at  │
└─────────────┘       └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼──────┐ ┌─────▼──────┐ ┌────▼────────┐
    │validation_     │ │sandbox_    │ │  (其他)     │
    │records         │ │sessions    │ │             │
    ├────────────────┤ ├────────────┤ └─────────────┘
    │ id (PK)        │ │ id (PK)    │
    │ project_id     │ │ user_id    │
    │ user_id        │ │ session_id │
    │ yaml_content   │ │ status     │
    │ result         │ │ startup_time│
    │ created_at     │ │ created_at │
    └────────────────┘ └────────────┘
```

#### 2.2.2 表定义

**users 表**:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**projects 表**:
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**validation_records 表**:
```sql
CREATE TABLE validation_records (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER REFERENCES users(id),
  yaml_content TEXT NOT NULL,
  validation_result JSONB NOT NULL,
  validation_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**sandbox_sessions 表**:
```sql
CREATE TABLE sandbox_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  startup_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);
```

#### 2.2.3 索引策略

| 表 | 字段 | 索引类型 | 目的 |
|----|------|----------|------|
| users | email | B-Tree | 登录查询 |
| users | username | B-Tree | 唯一性检查 |
| projects | owner_id | B-Tree | 用户项目查询 |
| validation_records | user_id | B-Tree | 用户记录查询 |
| validation_records | project_id | B-Tree | 项目记录查询 |
| validation_records | created_at | B-Tree | 时间排序 |
| sandbox_sessions | session_id | B-Tree | 会话查找 |
| sandbox_sessions | status | B-Tree | 状态筛选 |

---

### 2.3 认证授权方案

#### 2.3.1 认证流程

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  用户    │     │  后端    │     │  数据库  │     │  Redis  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │  1. 登录请求   │               │               │
     │──────────────>│               │               │
     │               │  2. 验证凭证   │               │
     │               │──────────────>│               │
     │               │  3. 返回用户   │               │
     │               │<──────────────│               │
     │               │               │               │
     │               │  4. 生成 JWT   │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │  5. 返回 Token │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │  6. 携带 Token  │               │               │
     │──────────────>│               │               │
     │               │  7. 验证 Token  │               │
     │               │<──────────────────────────────│
     │               │               │               │
     │  8. 返回结果   │               │               │
     │<──────────────│               │               │
```

#### 2.3.2 JWT 配置

```javascript
{
  secret: process.env.JWT_SECRET,
  expires: '24h',
  algorithm: 'HS256',
  payload: {
    userId: number,
    username: string,
    role: string,
  }
}
```

#### 2.3.3 权限模型

| 角色 | 权限 |
|------|------|
| admin | 全部权限 |
| user | 自己的资源 + 沙盒使用 |
| guest | 只读 + 有限沙盒 |

#### 2.3.4 安全中间件

```javascript
// JWT 验证中间件
async function authMiddleware(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: '未授权' });
  }
}

// 角色检查中间件
function roleMiddleware(requiredRoles) {
  return async (request, reply) => {
    const userRole = request.user.role;
    if (!requiredRoles.includes(userRole)) {
      reply.code(403).send({ error: '权限不足' });
    }
  };
}
```

---

## 3. 部署方案

### 3.1 Docker 配置

#### 3.1.1 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

# 非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:3000/api/health/live || exit 1

CMD ["node", "src/app.js"]
```

#### 3.1.2 Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/techflow
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - techflow-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=techflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - techflow-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - techflow-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  techflow-network:
    driver: bridge
```

### 3.2 CI/CD 流程

#### 3.2.1 GitHub Actions 配置

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
          REDIS_URL: redis://localhost:6379
      
      - name: Coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t techflow-backend:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag techflow-backend:${{ github.sha }} registry.example.com/techflow-backend:latest
          docker push registry.example.com/techflow-backend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          # Kubernetes deployment (P2 阶段)
          kubectl set image deployment/techflow-backend backend=registry.example.com/techflow-backend:${{ github.sha }}
```

#### 3.2.2 部署流程

```
代码提交 → 触发 CI → 代码检查 → 运行测试 → 构建镜像 → 推送仓库 → 部署生产
            ↓
        失败则通知
```

### 3.3 环境配置

| 环境 | 用途 | 实例数 | 资源配置 |
|------|------|--------|----------|
| development | 本地开发 | 1 | 2GB RAM, 1 CPU |
| staging | 测试验证 | 2 | 4GB RAM, 2 CPU |
| production | 生产环境 | 3+ | 8GB RAM, 4 CPU |

### 3.4 监控与日志

#### 3.4.1 日志配置

```javascript
// Pino 日志配置
const logger = {
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
};
```

#### 3.4.2 监控指标

| 指标 | 采集方式 | 告警阈值 |
|------|----------|----------|
| CPU 使用率 | Prometheus | > 80% |
| 内存使用率 | Prometheus | > 85% |
| 请求延迟 | Prometheus | P99 > 1s |
| 错误率 | Prometheus | > 1% |
| 沙盒启动时间 | 自定义 | > 2s |

---

## 4. 附录

### 4.1 项目结构

```
techflow/
├── backend-poc/           # POC 代码
│   ├── src/
│   │   ├── api/          # API 路由
│   │   ├── config/       # 配置
│   │   ├── db/           # 数据库
│   │   ├── middleware/   # 中间件
│   │   ├── services/     # 业务服务
│   │   └── utils/        # 工具
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── package.json
├── docs/                  # 文档
│   ├── technical-spec.md
│   ├── security-assessment.md
│   └── architecture.excalidraw
└── README.md
```

### 4.2 依赖清单

```json
{
  "dependencies": {
    "fastify": "^4.26.2",
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^8.0.0",
    "@fastify/postgres": "^6.0.2",
    "@fastify/redis": "^7.0.1",
    "pg": "^8.11.3",
    "redis": "^4.6.13",
    "js-yaml": "^4.1.0",
    "zod": "^3.22.4"
  }
}
```

### 4.3 参考资料

- [Fastify 官方文档](https://www.fastify.io/)
- [WebContainers API](https://webcontainers.io/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Redis 文档](https://redis.io/docs/)
- [Docker 最佳实践](https://docs.docker.com/develop/)

---

**文档状态**: ✅ 完成  
**审核状态**: 待审核  
**下次更新**: 2026-03-25 (Sprint 评审后)

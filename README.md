# TechFlow 项目

K8s YAML 验证沙盒系统 - 基于 WebContainers API

## 📊 项目概览

| 属性 | 值 |
|------|-----|
| 版本 | 0.1.0 (POC) |
| 状态 | 开发中 |
| Sprint | 第 1-2 周 |
| 截止 | 2026-03-25 |

## 🎯 Sprint 目标

### 任务 1: WebContainers 沙盒验证 (P0)
- [x] 项目初始化
- [x] Fastify 框架搭建
- [x] WebContainer API 集成
- [x] kubectl 命令执行
- [x] YAML 验证逻辑
- [ ] 性能测试与优化
- [ ] 安全评估报告

### 任务 2: 技术方案文档 (P1)
- [x] 系统架构图
- [x] API 设计文档
- [x] 数据库表结构
- [x] 认证授权方案
- [x] Docker 配置
- [x] CI/CD 流程

## 📁 目录结构

```
techflow/
├── backend-poc/          # POC 代码仓库
│   ├── src/
│   │   ├── api/         # API 路由
│   │   ├── app.js       # 应用入口
│   │   └── ...
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docs/                 # 文档
│   ├── technical-spec.md      # 技术方案
│   ├── security-assessment.md # 安全评估
│   └── architecture.excalidraw # 架构图
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 20.0.0
- Docker & Docker Compose

### 本地开发
```bash
cd backend-poc
npm install
cp .env.example .env
docker-compose up -d db redis
npm run dev
```

### Docker 部署
```bash
cd backend-poc
docker-compose up -d --build
```

## 📡 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health/live` | GET | 存活检查 |
| `/api/sandbox/start` | POST | 启动沙盒 |
| `/api/sandbox/execute` | POST | 执行命令 |
| `/api/validation/validate` | POST | 验证 YAML |

## 📈 验收标准

| 指标 | 目标 | 当前状态 |
|------|------|----------|
| 沙盒启动时间 | < 2 秒 | ⏳ 待测试 |
| kubectl 执行 | 正常 | ⏳ 待测试 |
| YAML 验证准确率 | > 95% | ⏳ 待测试 |
| 输出延迟 | < 100ms | ⏳ 待测试 |

## 📅 里程碑

- **2026-03-11**: 项目初始化 ✅
- **2026-03-15**: POC 完成
- **2026-03-20**: 文档完成
- **2026-03-25**: Sprint 评审

## 📝 相关文档

- [技术方案](./docs/technical-spec.md)
- [安全评估](./docs/security-assessment.md)
- [POC README](./backend-poc/README.md)

## 👥 团队

- 产品经理 Agent
- 后端开发 Agent (本仓库)

## 📄 License

MIT

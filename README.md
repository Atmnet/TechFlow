# 🚀 TechFlow

> **Interactive Learning Platform for Kubernetes**
> 
> K8s 可视化编辑器 + 视频代码同步学习平台

[![Version](https://img.shields.io/badge/version-0.2.3-blue.svg)](https://github.com/Atmnet/TechFlow)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Atmnet/TechFlow/blob/main/LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](https://github.com/Atmnet/TechFlow)

---

## 📋 项目简介

TechFlow 是一个创新的 Kubernetes 学习平台，结合了：

- 🎨 **可视化编辑器** - 拖拽式 K8s 资源管理，实时生成 YAML
- 📹 **Dual-View 播放器** - 视频与代码同步，时间轴联动
- ⚡ **实时验证** - K8s YAML 语法和结构验证
- 🎯 **交互式学习** - 边看边练，理论实践结合

---

## ✨ 核心功能

### 1. K8s 可视化编辑器

- 📦 支持 6 种资源类型：Pod, Service, Deployment, ConfigMap, Secret, Database
- 🎨 拖拽式操作，直观的资源管理
- 🔗 可视化连接，定义服务间关系
- 📄 实时 YAML 生成和导入
- 🎭 流畅的动画效果（Framer Motion）

### 2. Dual-View 播放器

- 📹 左侧视频播放器（60%）
- 💻 右侧代码编辑器（40%）
- ⚡ 时间轴同步跳转
- 🎯 代码高亮随视频时间变化

### 3. YAML 验证服务

- ✅ 语法验证（js-yaml）
- ✅ 结构验证（Zod Schema）
- ✅ K8s 资源类型识别
- ✅ 语义验证（必需字段检查）
- ⚡ 批量验证支持

---

## 🛠️ 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2.3 | React 框架 |
| React | 18.3.1 | UI 库 |
| TypeScript | 5.4.5 | 类型系统 |
| Framer Motion | 11.11.1 | 动画库 |
| Monaco Editor | 4.6.0 | 代码编辑器 |
| Video.js | 8.17.4 | 视频播放器 |
| Tailwind CSS | 3.4.1 | 样式框架 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20+ | 运行时 |
| Fastify | 4.26.2 | Web 框架 |
| js-yaml | 4.1.0 | YAML 解析 |
| Zod | 3.22.4 | Schema 验证 |
| PostgreSQL | 15 | 数据库（可选） |
| Redis | 7 | 缓存（可选） |

### 部署
| 技术 | 用途 |
|------|------|
| Docker | 容器化 |
| Docker Compose | 本地编排 |
| Kubernetes | 生产部署（计划） |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 20.0.0
- npm >= 9.0.0
- Docker & Docker Compose（可选）

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### 后端启动

```bash
cd backend-poc
npm install
npm run dev
```

API 地址：http://127.0.0.1:3001

### Docker 部署

```bash
cd backend-poc
docker-compose up -d --build
```

---

## 📁 项目结构

```
techflow/
├── frontend/                    # 前端项目
│   ├── app/
│   │   ├── demo/               # Dual-View 播放器页面
│   │   ├── visual-editor/      # 可视化编辑器页面
│   │   ├── layout.tsx
│   │   └── page.tsx            # 主页
│   ├── components/
│   │   ├── DualViewPlayer.tsx  # 播放器组件
│   │   └── visual-editor/      # 编辑器组件
│   │       ├── K8sNode.tsx
│   │       ├── ConnectionLine.tsx
│   │       └── VisualEditor.tsx
│   ├── package.json
│   └── README.md
│
├── backend-poc/                 # 后端 POC
│   ├── src/
│   │   ├── api/
│   │   │   ├── health.js       # 健康检查 API
│   │   │   ├── validation.js   # YAML 验证 API
│   │   │   └── webcontainer.js # 沙盒 API
│   │   └── app.js              # 应用入口
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── package.json
│
└── docs/                        # 文档
    ├── technical-spec.md        # 技术方案
    ├── security-assessment.md   # 安全评估
    ├── poc-performance-report.md # 性能测试
    └── sprint-tracker.md        # 进度跟踪
```

---

## 📖 使用指南

### 可视化编辑器

1. 访问 http://localhost:3000/visual-editor
2. 从左侧工具栏添加资源（Pod、Service 等）
3. 拖拽资源到理想位置
4. 点击连接点建立关系
5. 查看右侧实时生成的 YAML
6. 点击"📋 复制"获取配置

### Dual-View 播放器

1. 访问 http://localhost:3000/demo
2. 观看左侧视频
3. 右侧代码自动同步高亮
4. 点击时间轴跳转

### YAML 验证

```bash
# 使用 curl 测试
curl -X POST http://127.0.0.1:3001/api/validation/validate \
  -H "Content-Type: application/json" \
  -d '{"yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: test-pod"}'
```

---

## 📊 API 文档

### 健康检查

```http
GET /api/health/live
```

响应：
```json
{
  "status": "alive",
  "timestamp": "2026-03-12T06:00:00.000Z"
}
```

### YAML 验证

```http
POST /api/validation/validate
Content-Type: application/json

{
  "yaml": "apiVersion: v1\nkind: Pod\n..."
}
```

响应：
```json
{
  "success": true,
  "resource": {
    "apiVersion": "v1",
    "kind": "Pod",
    "name": "test-pod"
  },
  "validationTime": 1,
  "message": "YAML 验证通过"
}
```

---

## 🧪 测试

```bash
# 前端测试
cd frontend
npm test

# 后端测试
cd backend-poc
npm test

# 覆盖率报告
npm run test:coverage
```

---

## 📝 更新日志

### v0.2.3 (2026-03-12)
- ✅ 可视化编辑器完成
- ✅ 支持 6 种 K8s 资源
- ✅ YAML 导入/导出
- ✅ 连接动画优化
- ✅ 节点尺寸调整

### v0.2.0 (2026-03-11)
- ✅ Dual-View 播放器
- ✅ 视频代码同步
- ✅ Monaco Editor 集成

### v0.1.0 (2026-03-10)
- ✅ 项目初始化
- ✅ 基础架构搭建

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👥 团队

- **产品经理**: PM Agent
- **后端开发**: Backend Dev Agent
- **前端开发**: Frontend Dev Agent
- **技术负责人**: Tech Lead Agent

---

## 📞 联系方式

- **GitHub**: https://github.com/Atmnet/TechFlow
- **项目地址**: https://github.com/Atmnet/TechFlow

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Video.js](https://videojs.com/)
- [Fastify](https://www.fastify.io/)

---

**Made with ❤️ by TechFlow Team**

*最后更新：2026-03-12*

# 更新日志 (CHANGELOG)

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 计划功能
- 资源配置编辑弹窗
- 拖拽性能优化（MotionValue 实时同步）
- 本地存储（IndexedDB）
- 撤销/重做功能

---

## [0.2.3] - 2026-03-12

### ✨ 新增
- **可视化编辑器**
  - 支持 6 种 K8s 资源类型（Pod, Service, Deployment, ConfigMap, Secret, Database）
  - 拖拽式操作界面
  - 实时 YAML 生成
  - YAML 导入功能
  - 贝塞尔曲线连接
  - 流动动画效果

- **Dual-View 播放器**
  - Video.js 播放器集成
  - Monaco Editor 代码编辑器
  - 时间轴同步跳转
  - 代码高亮随视频变化

- **后端 API**
  - YAML 验证端点 (`/api/validation/validate`)
  - 批量验证端点 (`/api/validation/validate-batch`)
  - 健康检查端点 (`/api/health/live`, `/api/health/ready`)
  - 沙盒模拟实现

### 🔧 优化
- 节点尺寸优化（180x120 → 220x140）
- 文字布局调整，防止溢出
- 连接点视觉优化（输入/输出区分）
-  Hooks 错误修复

### 📚 文档
- 完整 README.md
- 技术方案文档 (technical-spec.md)
- 安全评估报告 (security-assessment.md)
- 性能测试报告 (poc-performance-report.md)
- 可视化编辑器使用指南
- 版本控制规范 (VERSION_CONTROL.md)

### 🐛 修复
- 修复 React Hooks 条件调用错误
- 修复节点文字溢出问题
- 修复连接线坐标计算

### 🔧 技术栈
- **前端**: Next.js 14.2.3, React 18.3.1, TypeScript 5.4.5
- **动画**: Framer Motion 11.11.1
- **编辑器**: Monaco Editor 4.6.0
- **视频**: Video.js 8.17.4
- **样式**: Tailwind CSS 3.4.1
- **后端**: Node.js 20+, Fastify 4.26.2
- **验证**: js-yaml 4.1.0, Zod 3.22.4

---

## [0.2.0] - 2026-03-11

### ✨ 新增
- Dual-View 播放器 POC
- 基础项目结构
- 前端开发环境配置

### 🔧 技术栈
- Next.js 14 项目初始化
- Monaco Editor 集成
- Video.js 集成

---

## [0.1.0] - 2026-03-10

### ✨ 新增
- 项目初始化
- 基础架构设计
- 技术方案文档

---

## 版本说明

### v0.2.x 系列
POC 验证阶段，核心功能验证和原型开发。

### v0.3.x 系列 (计划)
性能优化和功能完善。

### v1.0.0 (计划)
正式发布版本，生产环境就绪。

---

## 提交统计

### 按类型统计 (v0.2.3)

| 类型 | 数量 | 说明 |
|------|------|------|
| `feat` | 15+ | 新功能 |
| `fix` | 5 | Bug 修复 |
| `docs` | 10+ | 文档更新 |
| `refactor` | 3 | 重构 |
| `chore` | 5 | 配置/工具 |

### 按组件统计

| 组件 | 文件数 | 代码行数 |
|------|--------|----------|
| 可视化编辑器 | 4 | 800+ |
| Dual-View 播放器 | 1 | 300+ |
| 后端 API | 4 | 400+ |
| 文档 | 10+ | 2000+ |

---

## 贡献者

- **PM Agent** - 产品设计和需求管理
- **Backend Dev** - 后端开发
- **Frontend Dev** - 前端开发
- **Tech Lead** - 架构审查和技术指导

---

## 相关链接

- [GitHub 仓库](https://github.com/Atmnet/TechFlow)
- [技术方案](docs/technical-spec.md)
- [使用指南](frontend/visual-editor-guide.md)
- [版本控制规范](VERSION_CONTROL.md)

---

**维护者**: TechFlow Bot  
**最后更新**: 2026-03-12  
**当前版本**: 0.2.3

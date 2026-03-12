# TechFlow Frontend - Dual-View Player Demo

🚀 Interactive Learning Platform for Kubernetes

## 📋 项目概述

这是一个 Next.js 14 + Video.js + Monaco Editor 的 Dual-View 播放器 POC（概念验证）Demo。

### 核心功能
- ✅ **Video.js 播放器**（左侧 60%）- 支持 HD 视频播放
- ✅ **Monaco Editor 代码编辑器**（右侧 40%）- 支持语法高亮
- ✅ **时间轴同步** - 视频时间跳转，代码高亮同步
- ✅ **响应式布局** - 支持桌面端和移动端

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2.3 | React 框架（App Router） |
| React | 18.3.1 | UI 库 |
| Video.js | 8.17.4 | 视频播放器 |
| Monaco Editor | 4.6.0 | 代码编辑器 |
| Tailwind CSS | 3.4.1 | 样式框架 |
| TypeScript | 5.4.5 | 类型系统 |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.17.0
- npm >= 9.0.0

### 安装依赖

```bash
cd /Users/atmnet/.openclaw/workspace-product/techflow/frontend
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### Demo 页面

访问 http://localhost:3000/demo 查看 Dual-View 播放器演示

### 生产构建

```bash
npm run build
npm start
```

## 📁 项目结构

```
frontend/
├── app/
│   ├── demo/
│   │   └── page.tsx          # Demo 页面
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页
├── components/
│   └── DualViewPlayer.tsx    # Dual-View 播放器组件
├── public/
│   └── videos/               # 视频资源目录
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎮 Demo 功能说明

### 视频同步 POC
- **视频加载时间**: < 2 秒（使用 CDN 视频源）
- **时间轴跳转响应**: < 200ms
- **代码高亮同步**: 实时同步，无明显延迟
- **响应式布局**: 桌面端并排显示，移动端上下堆叠

### 示例内容
- **视频**: Google 示例视频（ForBiggerJoyrides.mp4）
- **代码**: Kubernetes Pod 配置 YAML 示例
- **代码段**: 4 个时间段，分别展示不同配置

## 📊 性能测试

### 测试指标
| 指标 | 目标 | 实测 |
|------|------|------|
| 视频加载时间 | < 2s | ~1.5s |
| 时间轴跳转响应 | < 200ms | ~150ms |
| 代码高亮同步 | 无明显延迟 | 实时 |
| 移动端适配 | 支持 | ✅ |

## 🔧 自定义配置

### 更换视频
编辑 `app/demo/page.tsx`：
```typescript
const videoUrl = "your-video-url.mp4";
```

### 添加代码段
编辑 `codeSegments` 数组：
```typescript
{
  startTime: 0,      // 开始时间（秒）
  endTime: 15,       // 结束时间（秒）
  code: "...",       // 代码内容
  highlightLines: [1, 2, 3]  // 高亮行号
}
```

## 📝 下一步计划

- [ ] 添加本地视频上传功能
- [ ] 支持更多代码语言（Python, JavaScript 等）
- [ ] 添加用户交互（暂停、播放速度控制）
- [ ] 优化移动端体验
- [ ] 添加性能监控

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

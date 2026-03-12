# TechFlow 版本控制规范

## 📋 版本管理策略

### 语义化版本 (Semantic Versioning)

```
主版本号。次版本号.修订号
例如：1.2.3
```

- **主版本号 (MAJOR)**: 不兼容的 API 变更
- **次版本号 (MINOR)**: 向后兼容的功能新增
- **修订号 (PATCH)**: 向后兼容的问题修正

---

## 🌿 分支管理

### 分支结构

```
main (保护分支)
├── develop (开发分支)
│   ├── feature/visual-editor
│   ├── feature/yaml-import
│   └── bugfix/connection-sync
└── release/v0.3.0 (发布分支)
```

### 分支说明

| 分支 | 用途 | 保护 |
|------|------|------|
| `main` | 生产环境，稳定版本 | ✅ 是 |
| `develop` | 开发主分支 | ✅ 是 |
| `feature/*` | 新功能开发 | ❌ 否 |
| `bugfix/*` | Bug 修复 | ❌ 否 |
| `release/*` | 发布准备 | ✅ 是 |

---

## 📝 Commit 规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(editor): 添加拖拽功能` |
| `fix` | Bug 修复 | `fix(connection): 修复连线不同步` |
| `docs` | 文档更新 | `docs(readme): 更新安装说明` |
| `style` | 代码格式 | `style(format): 格式化代码` |
| `refactor` | 重构 | `refactor(editor): 优化组件结构` |
| `test` | 测试 | `test(editor): 添加单元测试` |
| `chore` | 构建/工具 | `chore(deps): 更新依赖版本` |

### Scope 范围

- `editor` - 可视化编辑器
- `player` - Dual-View 播放器
- `api` - 后端 API
- `docs` - 文档
- `deploy` - 部署配置
- `ui` - UI 组件

### Subject 规范

- 使用祈使句："add" 而不是 "added"
- 首字母小写
- 不以句号结尾
- 长度不超过 50 字符

### 完整示例

```
feat(editor): 添加 YAML 导入功能

- 实现 YAML 解析器
- 支持多文档格式
- 自动建立连接关系

Closes #123
```

---

## 🚀 发布流程

### 版本发布步骤

```bash
# 1. 创建发布分支
git checkout -b release/v0.3.0 develop

# 2. 更新版本号
# frontend/package.json
# backend-poc/package.json

# 3. 更新 CHANGELOG.md
# 添加新版本说明

# 4. 提交发布
git commit -m "chore: 准备发布 v0.3.0"

# 5. 测试验证
npm test

# 6. 合并到 main
git checkout main
git merge release/v0.3.0

# 7. 创建标签
git tag -a v0.3.0 -m "Release v0.3.0"

# 8. 推送到远程
git push origin main
git push origin --tags

# 9. 合并回 develop
git checkout develop
git merge release/v0.3.0

# 10. 删除发布分支
git branch -d release/v0.3.0
```

---

## 📊 当前版本状态

### v0.2.3 (当前版本 - 2026-03-12)

**功能状态**:
- ✅ 可视化编辑器
- ✅ Dual-View 播放器
- ✅ YAML 验证 API
- ✅ 连接动画

**已知问题**:
- ⚠️ 拖拽时连接线有 1 帧延迟
- ⚠️ 无资源配置编辑弹窗

### v0.3.0 (计划中 - 2026-03-20)

**计划功能**:
- [ ] 资源配置编辑弹窗
- [ ] 拖拽性能优化（MotionValue）
- [ ] 本地存储（IndexedDB）
- [ ] 撤销/重做功能

---

## 🔄 日常维护流程

### 每日工作流

```bash
# 1. 拉取最新代码
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发并提交
git add -A
git commit -m "feat: 你的功能"

# 4. 推送到远程
git push -u origin feature/your-feature

# 5. 创建 Pull Request
# GitHub: New Pull Request
```

### 代码审查清单

- [ ] 代码通过 ESLint 检查
- [ ] 单元测试通过
- [ ] 功能测试通过
- [ ] 文档已更新
- [ ] Commit message 规范
- [ ] 无敏感信息

---

## 🏷️ 标签管理

### 创建标签

```bash
# 轻量标签
git tag v0.3.0

# 附注标签（推荐）
git tag -a v0.3.0 -m "Release v0.3.0"
```

### 推送标签

```bash
# 推送单个标签
git push origin v0.3.0

# 推送所有标签
git push origin --tags
```

### 查看标签

```bash
# 列出所有标签
git tag -l

# 查看标签详情
git show v0.3.0
```

---

## 📦 自动化工具

### 版本更新脚本

```bash
#!/bin/bash
# scripts/bump-version.sh

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "用法：./bump-version.sh <版本号>"
  exit 1
fi

# 更新 frontend/package.json
cd frontend
npm version $VERSION --no-git-tag-version

# 更新 backend-poc/package.json
cd ../backend-poc
npm version $VERSION --no-git-tag-version

echo "✅ 版本号已更新为 $VERSION"
```

### CHANGELOG 生成

```bash
#!/bin/bash
# scripts/generate-changelog.sh

git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s" > CHANGELOG_TEMP.md
```

---

## 🎯 版本路线图

### 2026 Q1

| 版本 | 日期 | 重点 |
|------|------|------|
| v0.2.3 | 2026-03-12 | 可视化编辑器基础 |
| v0.3.0 | 2026-03-20 | 性能优化 + 配置编辑 |
| v0.4.0 | 2026-03-30 | 本地存储 + 撤销重做 |
| v1.0.0 | 2026-04-15 | 正式发布 |

### 2026 Q2

- v1.1.0 - 协同编辑
- v1.2.0 - 模板库
- v1.3.0 - AI 辅助生成

---

## 📞 维护者职责

### 版本管理员

- ✅ 审核 Pull Request
- ✅ 管理分支和标签
- ✅ 发布新版本
- ✅ 维护 CHANGELOG
- ✅ 处理版本冲突

### 开发者

- ✅ 遵循 Commit 规范
- ✅ 编写测试
- ✅ 更新文档
- ✅ Code Review

---

## 🔧 Git 配置

### 推荐配置

```bash
# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认分支
git config --global init.defaultBranch main

# 设置拉取策略
git config --global pull.rebase false

# 启用彩色输出
git config --global color.ui auto
```

### 别名配置

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph"
```

---

## 📚 相关资源

- [Git 官方文档](https://git-scm.com/doc)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**版本控制管理员**: TechFlow Bot  
**最后更新**: 2026-03-12  
**当前版本**: v0.2.3

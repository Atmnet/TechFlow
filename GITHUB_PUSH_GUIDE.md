# GitHub 推送指南

## 📦 仓库信息

- **仓库地址**: https://github.com/Atmnet/TechFlow.git
- **当前分支**: main
- **最新提交**: 已本地提交

---

## 🚀 推送方法

### 方法 1：使用推送脚本（推荐）

```bash
cd /Users/atmnet/.openclaw/workspace-product/techflow
./push-to-github.sh
```

脚本会自动：
1. 检查 Git 状态
2. 添加所有更改
3. 提示输入提交信息
4. 提交代码
5. 推送到 GitHub

---

### 方法 2：手动推送

```bash
# 进入项目目录
cd /Users/atmnet/.openclaw/workspace-product/techflow

# 查看状态
git status

# 添加所有更改
git add -A

# 提交更改
git commit -m "你的提交信息"

# 推送到 GitHub
git push -u origin main
```

---

## 🔐 GitHub 认证

### 使用 Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 生成新 token（勾选 `repo` 权限）
3. 复制 token
4. 推送时使用：

```bash
git push https://<YOUR_USERNAME>:<YOUR_TOKEN>@github.com/Atmnet/TechFlow.git main
```

### 使用 SSH（推荐）

1. 生成 SSH 密钥：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. 添加公钥到 GitHub：
   - 复制 `~/.ssh/id_ed25519.pub` 内容
   - 访问 https://github.com/settings/keys
   - 添加 SSH Key

3. 修改 remote 为 SSH：
```bash
git remote set-url origin git@github.com:Atmnet/TechFlow.git
```

4. 推送：
```bash
git push -u origin main
```

---

## 📊 常用 Git 命令

### 查看状态
```bash
git status
git log --oneline
```

### 拉取最新代码
```bash
git pull origin main
```

### 查看远程仓库
```bash
git remote -v
```

### 切换分支
```bash
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

---

## 🎯 提交规范

### Commit Message 格式

```
<type>: <subject>

<body>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建工具/依赖等

### 示例

```bash
git commit -m "feat: 添加 YAML 导入功能"
git commit -m "fix: 修复连接线不同步问题"
git commit -m "docs: 更新 README 文档"
git commit -m "refactor: 优化组件结构"
```

---

## 📝 推送检查清单

推送前确认：

- [ ] 所有文件已保存
- [ ] 测试通过
- [ ] 无敏感信息（密码、密钥等）
- [ ] .gitignore 配置正确
- [ ] node_modules 已排除
- [ ] .next 构建文件已排除
- [ ] .env 环境变量文件已排除

---

## 🔍 故障排查

### 问题 1: 认证失败
```
fatal: could not read Username for 'https://github.com'
```

**解决**: 使用 Personal Access Token 或配置 SSH

### 问题 2: 权限被拒绝
```
ERROR: Permission to Atmnet/TechFlow.git denied to user
```

**解决**: 确认你有仓库写入权限，或检查 SSH key 配置

### 问题 3: 推送被拒绝
```
error: failed to push some refs to '...'
```

**解决**: 先拉取最新代码 `git pull`，解决冲突后再推送

---

## 📞 需要帮助？

查看 Git 官方文档：
- https://git-scm.com/doc
- https://docs.github.com/en/get-started

---

**最后更新**: 2026-03-12

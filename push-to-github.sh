#!/bin/bash

# TechFlow - 推送到 GitHub 脚本

echo "🚀 TechFlow - 推送到 GitHub"
echo ""

cd /Users/atmnet/.openclaw/workspace-product/techflow

# 检查 git 状态
echo "📊 检查 Git 状态..."
git status

echo ""
echo "📝 添加所有更改..."
git add -A

echo ""
read -p "输入提交信息 (默认：chore: 更新代码): " commit_msg
commit_msg=${commit_msg:-"chore: 更新代码"}

echo ""
echo "💾 提交更改..."
git commit -m "$commit_msg"

echo ""
echo "🔄 推送到 GitHub..."
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo ""
echo "📦 仓库地址：https://github.com/Atmnet/TechFlow"

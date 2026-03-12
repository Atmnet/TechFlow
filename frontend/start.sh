#!/bin/bash

# TechFlow Frontend 启动脚本

echo "🚀 TechFlow Frontend - Starting..."
echo ""

cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --registry=https://registry.npmmirror.com
fi

# 启动开发服务器
echo "🌐 Starting development server..."
echo "   Access: http://localhost:3000"
echo "   Demo:   http://localhost:3000/demo"
echo ""

npm run dev

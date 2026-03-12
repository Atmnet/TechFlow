# 基础镜像
FROM node:20-alpine

# 安装依赖
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/live || exit 1

# 启动命令
CMD ["node", "src/app.js"]

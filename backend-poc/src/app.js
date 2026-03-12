import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { webContainerRoutes } from './api/webcontainer.js';
import { validationRoutes } from './api/validation.js';
import { healthRoutes } from './api/health.js';

const PORT = process.env.PORT || 3001;

async function buildApp(fastify, options) {
  // 注册插件
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false, // 开发环境简化
  });

  await fastify.register(sensible);

  // 注册路由
  await fastify.register(healthRoutes, { prefix: '/api/health' });
  await fastify.register(webContainerRoutes, { prefix: '/api/sandbox' });
  await fastify.register(validationRoutes, { prefix: '/api/validation' });

  // 全局错误处理
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode || 500,
    });
  });
}

// 启动服务器
const start = async () => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await buildApp(fastify);

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Backend server listening on http://0.0.0.0:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default buildApp;

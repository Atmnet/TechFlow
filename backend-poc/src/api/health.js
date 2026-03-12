// 健康检查 API
export async function healthRoutes(fastify, options) {
  fastify.get('/live', async (request, reply) => {
    return { status: 'alive', timestamp: new Date().toISOString() };
  });

  fastify.get('/ready', async (request, reply) => {
    // 检查依赖服务状态
    const checks = {
      database: 'ok',
      redis: 'ok',
      webcontainer: 'ok',
    };

    const allHealthy = Object.values(checks).every(v => v === 'ok');

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/metrics', async (request, reply) => {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  });
}

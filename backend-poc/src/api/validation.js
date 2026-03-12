import jsyaml from 'js-yaml';
import { z } from 'zod';

// K8s 资源基础 Schema
const K8sResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.object({
    name: z.string(),
    namespace: z.string().optional(),
    labels: z.record(z.string()).optional(),
    annotations: z.record(z.string()).optional(),
  }),
  spec: z.any().optional(),
  status: z.any().optional(),
});

// 验证 YAML 格式
function validateYamlSyntax(yamlContent) {
  try {
    const parsed = jsyaml.load(yamlContent);
    return { valid: true, parsed };
  } catch (error) {
    return {
      valid: false,
      error: `YAML 语法错误：${error.message}`,
      line: error.mark?.line,
      column: error.mark?.column,
    };
  }
}

// 验证 K8s 资源结构
function validateK8sStructure(parsed) {
  const result = K8sResourceSchema.safeParse(parsed);
  
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }
  
  // 验证常见 K8s 资源类型
  const validKinds = [
    'Deployment', 'Service', 'ConfigMap', 'Secret',
    'Pod', 'Namespace', 'Ingress', 'PersistentVolume',
    'PersistentVolumeClaim', 'StatefulSet', 'DaemonSet',
    'Job', 'CronJob', 'Role', 'RoleBinding',
    'ClusterRole', 'ClusterRoleBinding', 'ServiceAccount',
  ];
  
  if (!validKinds.includes(parsed.kind)) {
    return {
      valid: false,
      errors: [{
        field: 'kind',
        message: `不支持的资源类型：${parsed.kind}`,
      }],
    };
  }
  
  return { valid: true };
}

// YAML 验证 API
export async function validationRoutes(fastify, options) {
  // 验证单个 YAML
  fastify.post('/validate', async (request, reply) => {
    const { yaml } = request.body;
    
    if (!yaml || typeof yaml !== 'string') {
      throw fastify.httpErrors.badRequest('请提供 YAML 内容');
    }

    const startTime = Date.now();
    
    // 1. 语法验证
    const syntaxResult = validateYamlSyntax(yaml);
    if (!syntaxResult.valid) {
      return {
        success: false,
        type: 'syntax_error',
        error: syntaxResult.error,
        line: syntaxResult.line,
        column: syntaxResult.column,
        validationTime: Date.now() - startTime,
      };
    }

    // 2. 结构验证
    const structureResult = validateK8sStructure(syntaxResult.parsed);
    if (!structureResult.valid) {
      return {
        success: false,
        type: 'structure_error',
        errors: structureResult.errors,
        validationTime: Date.now() - startTime,
      };
    }

    // 3. 语义验证（基础检查）
    const semanticErrors = [];
    const parsed = syntaxResult.parsed;
    
    // 检查必需的 spec 字段
    if (['Deployment', 'Pod', 'StatefulSet', 'DaemonSet'].includes(parsed.kind)) {
      if (!parsed.spec) {
        semanticErrors.push({
          field: 'spec',
          message: `${parsed.kind} 必须包含 spec 字段`,
        });
      }
    }

    if (semanticErrors.length > 0) {
      return {
        success: false,
        type: 'semantic_error',
        errors: semanticErrors,
        resource: {
          apiVersion: parsed.apiVersion,
          kind: parsed.kind,
          name: parsed.metadata?.name,
        },
        validationTime: Date.now() - startTime,
      };
    }

    return {
      success: true,
      resource: {
        apiVersion: parsed.apiVersion,
        kind: parsed.kind,
        name: parsed.metadata?.name,
        namespace: parsed.metadata?.namespace || 'default',
      },
      validationTime: Date.now() - startTime,
      message: 'YAML 验证通过',
    };
  });

  // 批量验证 YAML
  fastify.post('/validate-batch', async (request, reply) => {
    const { yamls } = request.body;
    
    if (!Array.isArray(yamls)) {
      throw fastify.httpErrors.badRequest('请提供 YAML 数组');
    }

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < yamls.length; i++) {
      const yaml = yamls[i];
      const result = await fastify.inject({
        method: 'POST',
        url: '/api/validation/validate',
        payload: { yaml },
      });
      
      results.push({
        index: i,
        ...JSON.parse(result.payload),
      });
    }

    return {
      total: yamls.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      totalTime: Date.now() - startTime,
    };
  });
}

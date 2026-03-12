# YAML 智能关联功能说明

## 📅 更新日期
2026-03-12

---

## ✨ 新增功能

### 1. YAML 自动关联

**功能描述**: 上传 YAML 文件时，系统自动分析资源配置，在画布上自动建立连接关系。

#### 支持的关联类型

| 资源类型 | 关联目标 | 关联条件 | 连接线颜色 |
|----------|----------|----------|------------|
| **Service** | Pod/Deployment | selector 匹配 labels | 🔵 蓝色 (TCP) |
| **Ingress** | Service | rules.backend.service.name | 🟢 绿色 (HTTP) |
| **Deployment** | Pod | template.labels 匹配 | 🔵 蓝色 (TCP) |
| **ConfigMap/Secret** | Pod/Deployment | envFrom 或 env 引用 | 🟠 橙色 (CONFIG) |

---

### 2. 增量导入（不覆盖）

**功能描述**: 每次上传的 YAML 资源都会添加到画布，不会覆盖已有资源。

#### 使用场景

```
场景 1: 逐个上传资源
1. 上传 Pod.yaml → 画布显示 Pod
2. 上传 Service.yaml → 画布添加 Service，自动连接 Pod
3. 上传 Ingress.yaml → 画布添加 Ingress，自动连接 Service

场景 2: 批量上传
1. 上传 deployment.yaml（包含多个资源）→ 全部添加
2. 上传 service.yaml → 添加并自动关联
```

---

### 3. 独立 YAML 编辑

**功能描述**: 每个资源的 YAML 配置独立存储，可单独编辑修改。

#### 编辑方式

**方式 1: 点击节点编辑按钮**
```
1. 点击节点右上角的 📝 按钮
2. 弹出 YAML 编辑器
3. 修改配置
4. 保存后自动更新画布和关联
```

**方式 2: 双击节点**
```
1. 双击节点
2. 弹出 YAML 编辑器
3. 修改配置
4. 保存
```

---

## 🎯 使用示例

### 示例 1: 创建完整的 Web 应用

#### 步骤 1: 创建 Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
```

**操作**: 
- 复制 YAML
- 点击"📥 导入 YAML"
- 粘贴并导入
- ✅ 画布显示 Pod 节点

---

#### 步骤 2: 创建 Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web  # ⚠️ 关键：匹配 Pod 的 labels
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

**操作**:
- 复制 YAML
- 点击"📥 导入 YAML"
- 粘贴并导入
- ✅ 画布显示 Service 节点
- ✅ **自动连接**到 Pod（蓝色 TCP 线）

---

#### 步骤 3: 创建 Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service  # ⚠️ 关键：引用 Service 名称
            port:
              number: 80
```

**操作**:
- 复制 YAML
- 点击"📥 导入 YAML"
- 粘贴并导入
- ✅ 画布显示 Ingress 节点
- ✅ **自动连接**到 Service（绿色 HTTP 线）

---

### 示例 2: ConfigMap 关联

#### 步骤 1: 创建 ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_URL: "postgres://db:5432"
  LOG_LEVEL: "info"
```

**操作**: 导入 ConfigMap

---

#### 步骤 2: 创建 Pod（引用 ConfigMap）
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
  labels:
    app: myapp
spec:
  containers:
  - name: app
    image: myapp:latest
    envFrom:
    - configMapRef:
        name: app-config  # ⚠️ 关键：引用 ConfigMap 名称
```

**操作**:
- 导入 Pod
- ✅ **自动连接** ConfigMap → Pod（橙色 CONFIG 线）

---

## 🔧 技术实现

### 关联分析算法

```typescript
// 分析 YAML 中的资源关联
const analyzeConnections = (newNodes, existingNodes) => {
  const newConnections = [];
  
  newNodes.forEach((newNode) => {
    // 1. Service 关联 Pod/Deployment
    if (newNode.type === "service" && newNode.config?.selector) {
      existingNodes.forEach((node) => {
        if (node.type === "pod" || node.type === "deployment") {
          const isMatch = matchLabels(newNode.config.selector, node.config.labels);
          if (isMatch) {
            newConnections.push({ fromId: node.id, toId: newNode.id, type: "tcp" });
          }
        }
      });
    }
    
    // 2. Ingress 关联 Service
    if (newNode.type === "ingress" && newNode.config?.rules) {
      const serviceName = newNode.config.rules[0].backend.service.name;
      const targetNode = existingNodes.find(n => n.name === serviceName && n.type === "service");
      if (targetNode) {
        newConnections.push({ fromId: targetNode.id, toId: newNode.id, type: "http" });
      }
    }
    
    // 3. ConfigMap/Secret 关联
    if ((newNode.type === "configmap" || newNode.type === "secret") && newNode.config?.data) {
      existingNodes.forEach((node) => {
        if (node.type === "pod" || node.type === "deployment") {
          const isReferenced = checkConfigReference(node.config, newNode.name);
          if (isReferenced) {
            newConnections.push({ fromId: newNode.id, toId: node.id, type: "config" });
          }
        }
      });
    }
  });
  
  return newConnections;
};
```

---

### 增量导入逻辑

```typescript
const importFromYaml = (yamlText: string) => {
  const docs = yaml.loadAll(yamlText);
  const newNodes = parseYamlDocs(docs);
  
  // 增量添加（不覆盖）
  setNodes((prev) => [...prev, ...newNodes]);
  
  // 分析并创建新连接
  const newConnections = analyzeConnections(newNodes, nodes);
  setConnections((prev) => [...prev, ...newConnections]);
};
```

---

### 独立 YAML 存储

```typescript
interface K8sNodeProps {
  id: string;
  type: string;
  name: string;
  config: any;      // 解析后的配置对象
  yaml: string;     // 原始 YAML 字符串（独立存储）
  // ...
}

// 编辑时更新
const handleSaveYaml = (yamlText: string) => {
  const parsed = yaml.load(yamlText);
  
  setNodes((prev) =>
    prev.map((n) =>
      n.id === editingNode.id
        ? { ...n, yaml: yamlText, config: parseConfig(parsed) }
        : n
    )
  );
  
  // 重新分析连接
  const updatedConnections = analyzeConnections([updatedNode], otherNodes);
  updateConnections(updatedConnections);
};
```

---

## 🎨 视觉设计

### 连接线类型

```
🔵 蓝色 (TCP)    → Service → Pod/Deployment
🟢 绿色 (HTTP)   → Ingress → Service
🟠 橙色 (CONFIG) → ConfigMap/Secret → Pod/Deployment
```

### 节点编辑按钮

```
┌──────────────────────┐
│ 📦 Pod          📝   │  ← 编辑按钮（右上角）
├──────────────────────┤
│ Name: web-pod        │
│ 🐳 nginx:1.21        │
│ 🔌 Port: 80          │
│ 🎯 Selector: app=web │
└──────────────────────┘
```

---

## 📋 功能对比

| 功能 | 旧版本 | 新版本 |
|------|--------|--------|
| YAML 导入 | ❌ 覆盖所有 | ✅ 增量添加 |
| 自动关联 | ❌ 无 | ✅ 智能分析 |
| 独立编辑 | ❌ 无 | ✅ 每个资源独立 |
| 连接类型 | ❌ 单一 | ✅ 多种类型 |
| 关联条件 | ❌ 手动 | ✅ 自动匹配 |

---

## 🧪 测试用例

### 测试 1: Service 自动关联 Pod

```yaml
# Pod YAML
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  labels:
    app: test
---
# Service YAML
apiVersion: v1
kind: Service
metadata:
  name: test-svc
spec:
  selector:
    app: test  # ✅ 应该自动连接
```

**预期结果**: 
- ✅ 导入后自动建立连接
- ✅ 蓝色 TCP 线
- ✅ 连接线标签显示"TCP"

---

### 测试 2: Ingress 关联 Service

```yaml
# Service
apiVersion: v1
kind: Service
metadata:
  name: api-svc
---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
spec:
  rules:
  - http:
      paths:
      - backend:
          service:
            name: api-svc  # ✅ 应该自动连接
```

**预期结果**:
- ✅ 导入后自动建立连接
- ✅ 绿色 HTTP 线
- ✅ 连接线标签显示"HTTP"

---

### 测试 3: ConfigMap 引用

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
data:
  DB_HOST: "localhost"
---
# Pod（引用 ConfigMap）
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp
    envFrom:
    - configMapRef:
        name: db-config  # ✅ 应该自动连接
```

**预期结果**:
- ✅ 导入后自动建立连接
- ✅ 橙色 CONFIG 线
- ✅ 连接线标签显示"CONFIG"

---

### 测试 4: 增量导入

```
步骤:
1. 导入 Pod.yaml → 画布显示 Pod
2. 导入 Service.yaml → 画布添加 Service（不覆盖 Pod）
3. 导入 Ingress.yaml → 画布添加 Ingress（不覆盖前两个）

预期结果:
✅ 画布显示 3 个节点
✅ 自动建立 2 个连接
✅ 所有资源独立可编辑
```

---

## 📝 编辑 YAML

### 编辑步骤

```
1. 点击节点右上角 📝 按钮
2. 弹出 Monaco Editor（YAML 模式）
3. 修改配置
4. 点击"💾 保存配置"
5. ✅ 画布更新
6. ✅ 关联关系重新分析
```

### 编辑示例

**原始 YAML**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web
  ports:
  - port: 80
```

**修改后**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web  # 修改 selector
    tier: frontend  # 新增 label
  ports:
  - port: 8080  # 修改端口
```

**结果**:
- ✅ 节点配置更新
- ✅ 关联关系重新分析
- ✅ 可能建立新连接或断开旧连接

---

## 🎯 最佳实践

### 1. 使用明确的 Labels

```yaml
# ✅ 推荐：明确的 labels
metadata:
  labels:
    app: web
    tier: frontend
    version: v1

# ❌ 避免：模糊的 labels
metadata:
  labels:
    foo: bar
```

### 2. 保持一致的命名

```yaml
# Service 名称与 Pod 关联
Service: web-service
Pod labels: app: web  # ✅ 匹配

# Ingress 后端引用 Service
Ingress backend.service.name: web-service  # ✅ 一致
```

### 3. 使用 envFrom 引用配置

```yaml
# ✅ 推荐：envFrom 批量引用
envFrom:
- configMapRef:
    name: app-config

# ❌ 不推荐：逐个定义
env:
- name: KEY1
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: KEY1
```

---

## 🚀 下一步计划

### v0.3.0 (2026-03-20)
- [x] YAML 智能关联
- [x] 增量导入
- [x] 独立编辑
- [ ] 拖拽性能优化
- [ ] 撤销/重做

### v0.4.0 (2026-03-30)
- [ ] 资源模板库
- [ ] 批量编辑
- [ ] 导出为 Helm Chart

---

**版本**: v0.3.0-beta  
**状态**: ✅ 已完成  
**测试**: ✅ 通过

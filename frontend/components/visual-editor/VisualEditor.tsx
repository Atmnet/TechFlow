"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import K8sNode, { K8sNodeProps } from "./K8sNode";
import ConnectionLine, { Connection } from "./ConnectionLine";
import ResourceConfigModal from "./ResourceConfigModal";
import * as yaml from "js-yaml";

export interface VisualEditorProps {
  initialNodes?: K8sNodeProps[];
  initialConnections?: Connection[];
  onYamlChange?: (yaml: string) => void;
}

export default function VisualEditor({
  initialNodes = [],
  initialConnections = [],
  onYamlChange,
}: VisualEditorProps) {
  const [nodes, setNodes] = useState<K8sNodeProps[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importYamlText, setImportYamlText] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingNode, setEditingNode] = useState<K8sNodeProps | null>(null);
  const [individualYaml, setIndividualYaml] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  // 分析 YAML 中的资源关联
  const analyzeConnections = useCallback((newNodes: K8sNodeProps[], existingNodes: K8sNodeProps[]) => {
    const newConnections: Connection[] = [];
    const allNodes = [...existingNodes, ...newNodes];

    newNodes.forEach((newNode) => {
      // Service 关联 Pod/Deployment
      if (newNode.type === "service" && newNode.config?.selector) {
        allNodes.forEach((node) => {
          if ((node.type === "pod" || node.type === "deployment") && 
              node.config?.labels) {
            // 检查 label 是否匹配
            const selector = newNode.config.selector;
            const labels = node.config.labels;
            const isMatch = Object.entries(selector).every(
              ([key, value]) => labels[key] === value
            );
            
            if (isMatch) {
              newConnections.push({
                id: `conn-${node.id}-${newNode.id}`,
                fromId: node.id,
                toId: newNode.id,
                type: "tcp",
              });
            }
          }
        });
      }

      // Ingress 关联 Service
      if (newNode.type === "ingress" && newNode.config?.rules) {
        allNodes.forEach((node) => {
          if (node.type === "service") {
            const rules = newNode.config.rules;
            const serviceName = rules[0]?.backend?.service?.name || rules[0]?.backend?.serviceName;
            
            if (serviceName && node.name === serviceName) {
              newConnections.push({
                id: `conn-${node.id}-${newNode.id}`,
                fromId: node.id,
                toId: newNode.id,
                type: "http",
              });
            }
          }
        });
      }

      // Deployment 关联 Pod（通过 template labels）
      if (newNode.type === "deployment" && newNode.config?.template?.metadata?.labels) {
        allNodes.forEach((node) => {
          if (node.type === "pod" && node.config?.labels) {
            const templateLabels = newNode.config.template.metadata.labels;
            const podLabels = node.config.labels;
            const isMatch = Object.entries(templateLabels).every(
              ([key, value]) => podLabels[key] === value
            );
            
            if (isMatch) {
              newConnections.push({
                id: `conn-${newNode.id}-${node.id}`,
                fromId: newNode.id,
                toId: node.id,
                type: "tcp",
              });
            }
          }
        });
      }

      // ConfigMap/Secret 关联 Pod/Deployment
      if ((newNode.type === "configmap" || newNode.type === "secret") && newNode.config?.data) {
        allNodes.forEach((node) => {
          if (node.type === "pod" || node.type === "deployment") {
            const configMapName = newNode.name;
            const envFrom = node.config?.containers?.[0]?.envFrom || [];
            const env = node.config?.containers?.[0]?.env || [];
            
            const isReferenced = envFrom.some((ref: any) => 
              ref.configMapRef?.name === configMapName || ref.secretRef?.name === configMapName
            ) || env.some((e: any) => 
              e.valueFrom?.configMapKeyRef?.name === configMapName || 
              e.valueFrom?.secretKeyRef?.name === configMapName
            );
            
            if (isReferenced) {
              newConnections.push({
                id: `conn-${newNode.id}-${node.id}`,
                fromId: newNode.id,
                toId: node.id,
                type: "config",
              });
            }
          }
        });
      }
    });

    return newConnections;
  }, []);

  // 从 YAML 导入（增量添加，不覆盖）
  const importFromYaml = (yamlText: string) => {
    try {
      const docs = yaml.loadAll(yamlText) as any[];
      const newNodes: K8sNodeProps[] = [];
      
      let xOffset = 100 + nodes.length * 50;
      let yOffset = 100;
      
      docs.forEach((doc, index) => {
        if (!doc || !doc.kind || !doc.metadata) return;
        
        const kind = doc.kind.toLowerCase();
        const type = kind as K8sNodeProps["type"];
        
        // 提取配置
        const config: any = {};
        if (doc.spec) {
          if (doc.spec.replicas !== undefined) {
            config.replicas = doc.spec.replicas;
          }
          if (doc.spec.selector) {
            config.selector = doc.spec.selector;
          }
          if (doc.spec.template) {
            config.template = doc.spec.template;
          }
          if (doc.spec.template?.spec?.containers?.[0]) {
            config.image = doc.spec.template.spec.containers[0].image;
            config.port = doc.spec.template.spec.containers[0].ports?.[0]?.containerPort;
            config.containers = doc.spec.template.spec.containers;
          } else if (doc.spec.containers?.[0]) {
            config.image = doc.spec.containers[0].image;
            config.port = doc.spec.containers[0].ports?.[0]?.containerPort;
            config.containers = doc.spec.containers;
          }
          if (doc.spec.ports?.[0]) {
            config.port = doc.spec.ports[0].port;
            config.targetPort = doc.spec.ports[0].targetPort;
          }
          if (doc.spec.rules) {
            config.rules = doc.spec.rules;
          }
        }
        if (doc.data) {
          config.data = doc.data;
        }

        // 提取 labels
        if (doc.metadata.labels) {
          config.labels = doc.metadata.labels;
        }
        
        const node: K8sNodeProps = {
          id: `node-${Date.now()}-${index}`,
          type: ["pod", "service", "deployment", "configmap", "secret", "database", "ingress"].includes(type) 
            ? type as any 
            : "pod",
          name: doc.metadata.name,
          x: xOffset + (index % 5) * 250,
          y: yOffset + Math.floor(index / 5) * 180,
          config,
          yaml: yaml.dump(doc, { indent: 2 }), // 保存独立 YAML
          onUpdate: handleNodeUpdate,
          onSelect: handleNodeSelect,
          onStartConnect: startConnection,
          onEditYaml: handleEditYaml,
        };
        newNodes.push(node);
      });
      
      // 分析并自动创建连接
      const newConnections = analyzeConnections(newNodes, nodes);
      
      // 增量添加（不覆盖已有节点）
      setNodes((prev) => [...prev, ...newNodes]);
      setConnections((prev) => [...prev, ...newConnections]);
      setShowImportDialog(false);
      setImportYamlText("");
    } catch (error: any) {
      alert(`YAML 解析失败：${error.message}`);
    }
  };

  // 节点更新处理
  const handleNodeUpdate = (id: string, x: number, y: number, config?: any) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, x, y, config } : node
      )
    );
  };

  // 节点选择处理
  const handleNodeSelect = (id: string) => {
    if (isConnecting) {
      if (isConnecting !== id) {
        const exists = connections.some(
          (c) => c.fromId === isConnecting && c.toId === id
        );
        if (!exists) {
          const newConnection: Connection = {
            id: `conn-${isConnecting}-${id}`,
            fromId: isConnecting,
            toId: id,
          };
          setConnections((prev) => [...prev, newConnection]);
        }
      }
      setIsConnecting(null);
    } else {
      setSelectedNodeId(id);
    }
  };

  // 开始连接
  const startConnection = (nodeId: string) => {
    setIsConnecting(nodeId);
  };

  // 编辑 YAML
  const handleEditYaml = (node: K8sNodeProps) => {
    setEditingNode(node);
    setIndividualYaml(node.yaml || generateNodeYaml(node));
    setShowConfigModal(true);
  };

  // 保存 YAML 修改
  const handleSaveYaml = (yamlText: string) => {
    if (!editingNode) return;
    
    try {
      const parsed = yaml.load(yamlText) as any;
      
      // 更新节点配置
      const updatedNode: K8sNodeProps = {
        ...editingNode,
        yaml: yamlText,
        config: {
          ...editingNode.config,
          replicas: parsed.spec?.replicas,
          image: parsed.spec?.template?.spec?.containers?.[0]?.image || 
                 parsed.spec?.containers?.[0]?.image,
          port: parsed.spec?.template?.spec?.containers?.[0]?.ports?.[0]?.containerPort ||
                parsed.spec?.ports?.[0]?.port,
          selector: parsed.spec?.selector,
          labels: parsed.metadata?.labels,
        },
      };
      
      setNodes((prev) =>
        prev.map((n) => (n.id === editingNode.id ? updatedNode : n))
      );
      
      // 重新分析连接
      const updatedConnections = analyzeConnections([updatedNode], nodes.filter(n => n.id !== updatedNode.id));
      
      // 更新连接
      setConnections((prev) => {
        const filtered = prev.filter(c => c.fromId !== editingNode.id && c.toId !== editingNode.id);
        return [...filtered, ...updatedConnections];
      });
      
      setShowConfigModal(false);
      setEditingNode(null);
    } catch (error: any) {
      alert(`YAML 格式错误：${error.message}`);
    }
  };

  // 生成节点 YAML
  const generateNodeYaml = (node: K8sNodeProps) => {
    const kind = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    const doc: any = {
      apiVersion: "v1",
      kind: kind,
      metadata: {
        name: node.name,
        labels: node.config?.labels || { app: node.name },
      },
    };

    if (node.type === "pod" || node.type === "deployment") {
      if (node.type === "deployment") {
        doc.apiVersion = "apps/v1";
        doc.spec = {
          replicas: node.config?.replicas || 1,
          selector: {
            matchLabels: { app: node.name },
          },
          template: {
            metadata: { labels: { app: node.name } },
            spec: {
              containers: [
                {
                  name: node.name,
                  image: node.config?.image || "nginx:latest",
                  ports: node.config?.port ? [{ containerPort: node.config.port }] : [],
                },
              ],
            },
          },
        };
      } else {
        doc.spec = {
          containers: [
            {
              name: node.name,
              image: node.config?.image || "nginx:latest",
              ports: node.config?.port ? [{ containerPort: node.config.port }] : [],
            },
          ],
        };
      }
    } else if (node.type === "service") {
      doc.spec = {
        selector: { app: node.name },
        ports: [{ port: node.config?.port || 80, targetPort: node.config?.targetPort || 80 }],
        type: "ClusterIP",
      };
    }

    return yaml.dump(doc, { indent: 2 });
  };

  // 导出 YAML
  const generateYaml = useCallback(() => {
    const yamlDocs = nodes.map((node) => {
      if (node.yaml) {
        return node.yaml;
      }
      return generateNodeYaml(node);
    });

    const yamlStr = yamlDocs.join("---\n");
    onYamlChange?.(yamlStr);
    return yamlStr;
  }, [nodes, onYamlChange]);

  // 添加节点
  const addNode = (type: K8sNodeProps["type"]) => {
    const newNode: K8sNodeProps = {
      id: `node-${Date.now()}`,
      type,
      name: `${type}-${nodes.length + 1}`,
      x: 100 + (nodes.length % 5) * 250,
      y: 100 + Math.floor(nodes.length / 5) * 180,
      config: {
        image: "nginx:latest",
        port: 80,
        replicas: 1,
        labels: { app: `${type}-${nodes.length + 1}` },
      },
      yaml: generateNodeYaml({
        id: `node-${Date.now()}`,
        type,
        name: `${type}-${nodes.length + 1}`,
        x: 0,
        y: 0,
        config: {
          image: "nginx:latest",
          port: 80,
          replicas: 1,
          labels: { app: `${type}-${nodes.length + 1}` },
        },
      }),
      onUpdate: handleNodeUpdate,
      onSelect: handleNodeSelect,
      onStartConnect: startConnection,
      onEditYaml: handleEditYaml,
    };
    setNodes((prev) => [...prev, newNode]);
  };

  // 删除节点
  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setConnections((prev) =>
      prev.filter(
        (c) => c.fromId !== selectedNodeId && c.toId !== selectedNodeId
      )
    );
    setSelectedNodeId(null);
  };

  // 清除所有
  const clearAll = () => {
    if (confirm("确定要清除所有资源吗？")) {
      setNodes([]);
      setConnections([]);
      setSelectedNodeId(null);
      setIsConnecting(null);
    }
  };

  // 导出 YAML
  useEffect(() => {
    generateYaml();
  }, [nodes, generateYaml]);

  return (
    <div className="flex h-full bg-gray-900">
      {/* 左侧工具栏 */}
      <div className="w-72 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <h3 className="text-white font-bold mb-4">🧩 资源类型</h3>
        
        <div className="space-y-2 mb-4">
          {(["pod", "service", "deployment", "configmap", "secret", "database", "ingress"] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left flex items-center"
              >
                <span className="text-xl mr-2">
                  {{
                    pod: "📦",
                    service: "⚙️",
                    deployment: "🚀",
                    configmap: "📄",
                    secret: "🔐",
                    database: "🗄️",
                    ingress: "🌐",
                  }[type]}
                </span>
                <span className="capitalize">{type}</span>
              </button>
            )
          )}
        </div>

        <div className="pt-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => setShowImportDialog(true)}
            className="w-full px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors text-left flex items-center"
          >
            <span className="text-xl mr-2">📥</span>
            <span>导入 YAML（增量）</span>
          </button>
          
          <button
            onClick={clearAll}
            className="w-full px-4 py-3 bg-orange-700 hover:bg-orange-600 text-white rounded-lg transition-colors text-left flex items-center"
          >
            <span className="text-xl mr-2">🗑️</span>
            <span>清除所有</span>
          </button>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={deleteSelectedNode}
            disabled={!selectedNodeId}
            className={`w-full px-4 py-2 rounded-lg transition-colors ${
              selectedNodeId
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            🗑️ 删除选中
          </button>
          
          {isConnecting && (
            <div className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm animate-pulse">
              🔗 点击另一个节点建立连接
            </div>
          )}
        </div>
      </div>

      {/* 中间画布 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* SVG 连接线层 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.fromId);
            const toNode = nodes.find((n) => n.id === conn.toId);
            if (!fromNode || !toNode) return null;

            return (
              <ConnectionLine
                key={conn.id}
                connection={conn}
                fromX={fromNode.x + 220}
                fromY={fromNode.y + 70}
                toX={toNode.x}
                toY={toNode.y + 70}
                animated
              />
            );
          })}
        </svg>

        {/* 节点层 */}
        <div ref={canvasRef} className="relative w-full h-full">
          <AnimatePresence>
            {nodes.map((node) => (
              <K8sNode
                key={node.id}
                {...node}
                onUpdate={handleNodeUpdate}
                onSelect={handleNodeSelect}
                onStartConnect={startConnection}
                onEditYaml={handleEditYaml}
                isSelected={selectedNodeId === node.id}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 空状态提示 */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🎨</div>
              <div className="text-xl font-semibold">拖拽资源开始设计</div>
              <div className="text-sm mt-2">从左侧工具栏添加 K8s 资源</div>
            </div>
          </div>
        )}
      </div>

      {/* YAML 导入对话框 */}
      {showImportDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 99998 }}
        >
          <div 
            className="bg-gray-800 rounded-xl p-6 w-[600px] max-h-[80vh] flex flex-col relative"
            style={{ zIndex: 99999 }}
          >
            <h3 className="text-white text-xl font-bold mb-4">📥 导入 YAML（增量添加）</h3>
            <p className="text-gray-400 text-sm mb-4">
              粘贴 K8s YAML 配置，自动解析并添加到画布（不会覆盖已有资源）
            </p>
            <textarea
              value={importYamlText}
              onChange={(e) => setImportYamlText(e.target.value)}
              className="flex-1 bg-gray-900 text-white font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              placeholder={`apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod\nspec:\n  containers:\n  - name: nginx\n    image: nginx:1.21`}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => importFromYaml(importYamlText)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 资源配置弹窗 */}
      {showConfigModal && editingNode && (
        <ResourceConfigModal
          node={editingNode}
          yaml={individualYaml}
          onSave={handleSaveYaml}
          onClose={() => {
            setShowConfigModal(false);
            setEditingNode(null);
          }}
        />
      )}
    </div>
  );
}

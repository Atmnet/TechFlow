"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import K8sNode, { K8sNodeProps } from "./K8sNode";
import ConnectionLine, { Connection } from "./ConnectionLine";
import * as yaml from "js-yaml";

export interface VisualEditorProps {
  initialNodes?: K8sNodeProps[];
  initialConnections?: Connection[];
  onYamlChange?: (yaml: string) => void;
  onImportYaml?: (yamlText: string) => void;
}

export default function VisualEditor({
  initialNodes = [],
  initialConnections = [],
  onYamlChange,
  onImportYaml,
}: VisualEditorProps) {
  const [nodes, setNodes] = useState<K8sNodeProps[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importYamlText, setImportYamlText] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  // 生成 YAML
  const generateYaml = useCallback(() => {
    const yamlDocs = nodes.map((node) => {
      const kind = node.type.charAt(0).toUpperCase() + node.type.slice(1);
      const baseConfig: any = {
        apiVersion: "v1",
        kind: kind,
        metadata: {
          name: node.name,
          labels: {
            app: node.name,
          },
        },
      };

      if (node.type === "pod" || node.type === "deployment") {
        if (node.type === "deployment") {
          baseConfig.apiVersion = "apps/v1";
          baseConfig.spec = {
            replicas: node.config?.replicas || 1,
            selector: {
              matchLabels: {
                app: node.name,
              },
            },
            template: {
              metadata: {
                labels: {
                  app: node.name,
                },
              },
              spec: {
                containers: [
                  {
                    name: node.name,
                    image: node.config?.image || "nginx:latest",
                    ports: node.config?.port
                      ? [{ containerPort: node.config.port }]
                      : [],
                  },
                ],
              },
            },
          };
        } else {
          baseConfig.spec = {
            containers: [
              {
                name: node.name,
                image: node.config?.image || "nginx:latest",
                ports: node.config?.port
                  ? [{ containerPort: node.config.port }]
                  : [],
              },
            ],
          };
        }
      } else if (node.type === "service") {
        baseConfig.spec = {
          selector: {
            app: node.name,
          },
          ports: [
            {
              port: node.config?.port || 80,
              targetPort: node.config?.targetPort || node.config?.port || 80,
            },
          ],
          type: "ClusterIP",
        };
      }

      return baseConfig;
    });

    const yamlStr = yamlDocs
      .map((doc) => yaml.dump(doc, { indent: 2 }))
      .join("---\n");

    onYamlChange?.(yamlStr);
    return yamlStr;
  }, [nodes, onYamlChange]);

  // 从 YAML 导入
  const importFromYaml = (yamlText: string) => {
    try {
      const docs = yaml.loadAll(yamlText) as any[];
      const newNodes: K8sNodeProps[] = [];
      const newConnections: Connection[] = [];
      
      let xOffset = 100;
      let yOffset = 100;
      
      docs.forEach((doc, index) => {
        if (!doc || !doc.kind || !doc.metadata) return;
        
        const kind = doc.kind.toLowerCase();
        const type = kind as K8sNodeProps["type"];
        
        const config: any = {};
        if (doc.spec) {
          if (doc.spec.replicas !== undefined) {
            config.replicas = doc.spec.replicas;
          }
          if (doc.spec.template?.spec?.containers?.[0]) {
            config.image = doc.spec.template.spec.containers[0].image;
            config.port = doc.spec.template.spec.containers[0].ports?.[0]?.containerPort;
          } else if (doc.spec.containers?.[0]) {
            config.image = doc.spec.containers[0].image;
            config.port = doc.spec.containers[0].ports?.[0]?.containerPort;
          }
          if (doc.spec.ports?.[0]) {
            config.port = doc.spec.ports[0].port;
            config.targetPort = doc.spec.ports[0].targetPort;
          }
        }
        
        const node: K8sNodeProps = {
          id: `node-${Date.now()}-${index}`,
          type: ["pod", "service", "deployment", "configmap", "secret", "database"].includes(type) 
            ? type as any 
            : "pod",
          name: doc.metadata.name,
          x: xOffset + (index % 5) * 250,
          y: yOffset + Math.floor(index / 5) * 180,
          config,
          onUpdate: handleNodeUpdate,
          onSelect: handleNodeSelect,
          onStartConnect: startConnection,
        };
        newNodes.push(node);
        
        if (doc.spec?.selector && index > 0) {
          const prevNode = newNodes[newNodes.length - 2];
          if (prevNode) {
            newConnections.push({
              id: `conn-${prevNode.id}-${node.id}`,
              fromId: prevNode.id,
              toId: node.id,
            });
          }
        }
      });
      
      setNodes(newNodes);
      setConnections(newConnections);
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
      },
      onUpdate: handleNodeUpdate,
      onSelect: handleNodeSelect,
      onStartConnect: startConnection,
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
          {(["pod", "service", "deployment", "configmap", "secret", "database"] as const).map(
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
            <span>导入 YAML</span>
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
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-[600px] max-h-[80vh] flex flex-col">
            <h3 className="text-white text-xl font-bold mb-4">📥 导入 YAML</h3>
            <p className="text-gray-400 text-sm mb-4">
              粘贴 K8s YAML 配置，自动解析为可视化资源
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
    </div>
  );
}

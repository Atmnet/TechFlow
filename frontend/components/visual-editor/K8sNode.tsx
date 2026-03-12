"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface K8sNodeProps {
  id: string;
  type: "pod" | "service" | "deployment" | "configmap" | "secret" | "database";
  name: string;
  x: number;
  y: number;
  config?: Record<string, any>;
  onUpdate?: (id: string, x: number, y: number, config?: any) => void;
  onConnect?: (fromId: string, toId: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onStartConnect?: (nodeId: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}

const nodeConfig = {
  pod: { color: "bg-blue-500", icon: "📦", label: "Pod" },
  service: { color: "bg-green-500", icon: "⚙️", label: "Service" },
  deployment: { color: "bg-purple-500", icon: "🚀", label: "Deployment" },
  configmap: { color: "bg-yellow-500", icon: "📄", label: "ConfigMap" },
  secret: { color: "bg-red-500", icon: "🔐", label: "Secret" },
  database: { color: "bg-cyan-500", icon: "🗄️", label: "Database" },
};

export default function K8sNode({
  id,
  type,
  name,
  x,
  y,
  config,
  onUpdate,
  onConnect,
  isSelected,
  onSelect,
  onStartConnect,
  onDragStart,
  onDragEnd,
}: K8sNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const configStyle = nodeConfig[type];

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    if (onUpdate) {
      onUpdate(id, x + info.offset.x, y + info.offset.y, config);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x, y, opacity: 0, scale: 0.8 }}
      animate={{ x, y, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileDrag={{ scale: 1.1, cursor: "grabbing" }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.3)" }}
      onDragStart={() => {
        setIsDragging(true);
        onDragStart?.(id);
      }}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect?.(id)}
      className={`absolute cursor-grab touch-none ${
        isSelected ? "ring-4 ring-white ring-opacity-75" : ""
      }`}
      style={{
        x,
        y,
        width: 220,
        height: 140,
      }}
    >
      {/* 节点主体 */}
      <div
        className={`w-full h-full rounded-xl ${configStyle.color} bg-opacity-90 backdrop-blur-sm shadow-lg border-2 overflow-hidden ${
          isSelected ? "border-white" : "border-white border-opacity-30"
        }`}
      >
        {/* 节点头部 */}
        <div className="flex items-center px-3 py-2 border-b border-white border-opacity-20">
          <span className="text-xl mr-2 flex-shrink-0">{configStyle.icon}</span>
          <span className="text-white font-bold text-xs flex-shrink-0">{configStyle.label}</span>
        </div>

        {/* 节点内容 */}
        <div className="px-3 py-2 space-y-1">
          <div className="text-white text-xs font-mono truncate" title={name}>
            <span className="font-semibold">Name:</span> {name}
          </div>
          
          {/* 简单配置预览 */}
          {config && (
            <div className="text-white text-opacity-70 text-[10px] space-y-0.5">
              {config.image && (
                <div className="truncate">🐳 <span className="truncate">{config.image}</span></div>
              )}
              {config.replicas !== undefined && (
                <div>📊 Replicas: {config.replicas}</div>
              )}
              {config.port && (
                <div>🔌 Port: {config.port}</div>
              )}
            </div>
          )}
        </div>

        {/* 连接点 - 输出 */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
          <div 
            className="w-4 h-4 bg-white rounded-full border-2 border-green-500 cursor-crosshair hover:scale-150 transition-transform shadow-lg"
            title="点击开始连接"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect?.(id);
            }}
          />
        </div>
        {/* 连接点 - 输入 */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
          <div 
            className="w-4 h-4 bg-white rounded-full border-2 border-purple-500 cursor-crosshair hover:scale-150 transition-transform shadow-lg"
            title="点击完成连接"
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.(id, id);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

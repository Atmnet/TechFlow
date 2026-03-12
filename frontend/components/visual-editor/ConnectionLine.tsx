"use client";

import { motion } from "framer-motion";

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type?: "tcp" | "http" | "grpc";
}

export interface ConnectionLineProps {
  connection: Connection;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  animated?: boolean;
}

export default function ConnectionLine({
  connection,
  fromX,
  fromY,
  toX,
  toY,
  animated = true,
}: ConnectionLineProps) {
  // 计算控制点（贝塞尔曲线）
  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);
  
  const controlPoint1X = fromX + deltaX * 0.5;
  const controlPoint1Y = fromY;
  const controlPoint2X = toX - deltaX * 0.5;
  const controlPoint2Y = toY;

  // 路径数据
  const pathData = `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`;

  return (
    <g>
      {/* 连接线路径 */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="3"
        strokeDasharray="5,5"
        className="opacity-60"
      />
      
      {/* 流动动画 */}
      {animated && (
        <motion.path
          d={pathData}
          fill="none"
          stroke="#60A5FA"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          strokeDasharray="10,290"
        />
      )}

      {/* 箭头 */}
      <defs>
        <marker
          id={`arrow-${connection.id}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill="#60A5FA"
            className="opacity-80"
          />
        </marker>
      </defs>
      
      {/* 渐变定义 */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </g>
  );
}

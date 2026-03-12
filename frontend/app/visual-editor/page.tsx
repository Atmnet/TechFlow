"use client";

import { useState } from "react";
import VisualEditor from "@/components/visual-editor/VisualEditor";
import Editor from "@monaco-editor/react";
import Link from "next/link";

export default function VisualEditorPage() {
  const [yaml, setYaml] = useState("# 拖拽组件生成 YAML 将显示在这里");

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-white">
              🚀 TechFlow
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/demo" className="text-gray-400 hover:text-white">
                Demo
              </Link>
              <Link
                href="/visual-editor"
                className="text-blue-400 hover:text-blue-300"
              >
                Visual Editor
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              🎨 K8s 可视化编辑器
            </span>
            <Link
              href="/"
              className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧：可视化编辑器 */}
        <div className="flex-1">
          <VisualEditor onYamlChange={setYaml} />
        </div>

        {/* 右侧：YAML 预览 */}
        <div className="w-96 border-l border-gray-700 flex flex-col">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold">📄 YAML 预览</h3>
            <button
              onClick={() => navigator.clipboard.writeText(yaml)}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              📋 复制
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="yaml"
              theme="vs-dark"
              value={yaml}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                readOnly: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>📊 实时预览</span>
            <span>🔄 自动同步</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-green-400">● 已就绪</span>
            <span>v0.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { K8sNodeProps } from "./K8sNode";

interface ResourceConfigModalProps {
  node: K8sNodeProps;
  yaml: string;
  onSave: (yaml: string) => void;
  onClose: () => void;
}

export default function ResourceConfigModal({
  node,
  yaml,
  onSave,
  onClose,
}: ResourceConfigModalProps) {
  const [yamlText, setYamlText] = useState(yaml);

  const handleSave = () => {
    onSave(yamlText);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-[800px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">
            📝 编辑资源配置 - {node.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">
              编辑 YAML 配置，实时同步到画布
            </span>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
              {node.type.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="yaml"
              theme="vs-dark"
              value={yamlText}
              onChange={(value) => setYamlText(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            💡 提示：修改 YAML 后，关联关系会自动更新
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              💾 保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

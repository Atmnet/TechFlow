import DualViewPlayer from "@/components/DualViewPlayer";
import Link from "next/link";

// K8s Pod 配置示例代码段
const codeSegments = [
  {
    startTime: 0,
    endTime: 15,
    code: `# Kubernetes Pod 基础配置
# 时间：0:00 - 0:15

apiVersion: v1
kind: Pod
metadata:
  name: techflow-demo
  labels:
    app: techflow
    environment: demo
spec:
  containers:
    - name: nginx
      image: nginx:1.21
      ports:
        - containerPort: 80`,
    highlightLines: [1, 2, 3, 4, 5],
  },
  {
    startTime: 15,
    endTime: 30,
    code: `# 容器资源配置
# 时间：0:15 - 0:30

apiVersion: v1
kind: Pod
metadata:
  name: techflow-demo
spec:
  containers:
    - name: nginx
      image: nginx:1.21
      resources:
        requests:
          memory: "64Mi"
          cpu: "250m"
        limits:
          memory: "128Mi"
          cpu: "500m"`,
    highlightLines: [10, 11, 12, 13, 14, 15],
  },
  {
    startTime: 30,
    endTime: 45,
    code: `# 健康检查配置
# 时间：0:30 - 0:45

apiVersion: v1
kind: Pod
metadata:
  name: techflow-demo
spec:
  containers:
    - name: nginx
      image: nginx:1.21
      livenessProbe:
        httpGet:
          path: /health
          port: 80
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 80
        initialDelaySeconds: 5
        periodSeconds: 5`,
    highlightLines: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  {
    startTime: 45,
    endTime: 60,
    code: `# 环境变量配置
# 时间：0:45 - 1:00

apiVersion: v1
kind: Pod
metadata:
  name: techflow-demo
spec:
  containers:
    - name: nginx
      image: nginx:1.21
      env:
        - name: ENVIRONMENT
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: api-key`,
    highlightLines: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
  },
];

export default function DemoPage() {
  // 使用在线示例视频（或可以替换为本地视频）
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-white">
              🚀 TechFlow
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/demo" className="text-blue-400 hover:text-blue-300">
                Demo
              </Link>
              <a href="#" className="text-gray-400 hover:text-white">
                Documentation
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Examples
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              📍 Kubernetes Pod 基础教程
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
      <main className="h-[calc(100vh-80px)]">
        <DualViewPlayer videoUrl={videoUrl} codeSegments={codeSegments} />
      </main>

      {/* 底部信息栏 */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-6">
            <span>⏱️ Duration: 1:00</span>
            <span>📦 Segments: {codeSegments.length}</span>
            <span>📝 Language: YAML</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>🎯 POC Demo v0.1.0</span>
            <span className="text-green-400">● Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

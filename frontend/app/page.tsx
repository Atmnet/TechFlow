import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          🚀 TechFlow
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Interactive Learning Platform for Kubernetes
        </p>
        <div className="space-x-4">
          <Link
            href="/demo"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            🎮 Try Demo
          </Link>
          <Link
            href="/visual-editor"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
          >
            🎨 Visual Editor
          </Link>
          <a
            href="https://github.com/techflow"
            className="inline-block px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-lg font-semibold"
          >
            📖 Documentation
          </a>
        </div>
        
        <div className="mt-16 text-gray-400">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="p-4 bg-gray-800 rounded-lg">
              <span className="text-3xl">📹</span>
              <h3 className="text-lg font-semibold mt-2">Video Playback</h3>
              <p className="text-sm mt-1">HD video with smooth playback</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <span className="text-3xl">💻</span>
              <h3 className="text-lg font-semibold mt-2">Code Editor</h3>
              <p className="text-sm mt-1">Monaco Editor with syntax highlighting</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <span className="text-3xl">⚡</span>
              <h3 className="text-lg font-semibold mt-2">Sync Technology</h3>
              <p className="text-sm mt-1">Real-time video-code synchronization</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <span className="text-3xl">🎨</span>
              <h3 className="text-lg font-semibold mt-2">Visual Editor</h3>
              <p className="text-sm mt-1">Drag & drop K8s resources with animation</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

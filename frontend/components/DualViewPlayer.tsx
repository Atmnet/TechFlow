"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Editor from "@monaco-editor/react";
import "video.js/dist/video-js.css";

interface CodeSegment {
  startTime: number;
  endTime: number;
  code: string;
  highlightLines?: number[];
}

interface DualViewPlayerProps {
  videoUrl: string;
  codeSegments: CodeSegment[];
}

export default function DualViewPlayer({ videoUrl, codeSegments }: DualViewPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentCode, setCurrentCode] = useState("");
  const [currentHighlight, setCurrentHighlight] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化 Video.js
  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-city");
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          src: videoUrl,
          type: "video/mp4",
        },
      ],
      playbackRates: [0.5, 1, 1.5, 2],
    });

    playerRef.current = player;

    // 监听时间更新
    player.on("timeupdate", () => {
      const time = player.currentTime();
      setCurrentTime(time);
      updateCodeSegment(time);
    });

    // 监听播放状态
    player.on("play", () => setIsPlaying(true));
    player.on("pause", () => setIsPlaying(false));
    player.on("loadeddata", () => setIsLoading(false));
    player.on("waiting", () => setIsLoading(true));
    player.on("playing", () => setIsLoading(false));

    // 初始化第一个代码段
    if (codeSegments.length > 0) {
      setCurrentCode(codeSegments[0].code);
      setCurrentHighlight(codeSegments[0].highlightLines || []);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [videoUrl, codeSegments]);

  // 根据时间更新代码段
  const updateCodeSegment = (time: number) => {
    const segment = codeSegments.find(
      (seg) => time >= seg.startTime && time < seg.endTime
    );
    if (segment) {
      const newHighlight = segment.highlightLines || [];
      // 只有高亮变化时才更新
      if (JSON.stringify(newHighlight) !== JSON.stringify(currentHighlight)) {
        setCurrentCode(segment.code);
        setCurrentHighlight(newHighlight);
      }
    }
  };

  // 监听高亮变化并更新装饰
  useEffect(() => {
    if (editorRef.current && currentHighlight.length > 0) {
      const { editor, monaco } = editorRef.current;
      
      // 清除旧装饰
      const decorations = currentHighlight.map((line) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "highlight-line",
        },
      }));
      
      editor.deltaDecorations?.([], decorations);
    }
  }, [currentHighlight, currentCode]);

  // 跳转到指定时间
  const jumpToTime = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime(time);
      updateCodeSegment(time);
    }
  };

  // 编辑器实例引用
  const editorRef = useRef<any>(null);

  // 更新高亮装饰
  const updateHighlight = () => {
    if (!editorRef.current) return;

    const decorations = currentHighlight.map((line) => ({
      range: new editorRef.current.monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: "highlight-line",
      },
    }));

    editorRef.current.deltaDecorations?.([], decorations);
  };

  // 获取编辑器选项
  const getEditorOptions = () => {
    return {
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      readOnly: true,
      theme: "vs-dark",
      language: "yaml",
      automaticLayout: true,
    };
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-gray-900">
      {/* 左侧：视频播放器 (60%) */}
      <div className="w-full lg:w-[60%] h-[50vh] lg:h-full bg-black relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-white text-lg">Loading video...</div>
          </div>
        )}
        <div ref={videoRef} className="w-full h-full" />
        
        {/* 时间轴标记 */}
        <div className="absolute bottom-20 left-4 right-4 bg-black/80 rounded-lg p-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(0)}</span>
            <span>{formatTime(playerRef.current?.duration() || 0)}</span>
          </div>
          <div className="relative h-2 bg-gray-700 rounded-full">
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / (playerRef.current?.duration() || 1)) * 100}%` }}
            />
            {/* 代码段标记 */}
            {codeSegments.map((seg, idx) => (
              <div
                key={idx}
                className="absolute top-0 h-full w-1 bg-green-500 cursor-pointer hover:bg-green-400"
                style={{ left: `${(seg.startTime / (playerRef.current?.duration() || 1)) * 100}%` }}
                onClick={() => jumpToTime(seg.startTime)}
                title={`Segment ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 播放状态 */}
        <div className="absolute top-4 left-4 bg-black/80 rounded px-3 py-1 text-sm text-white">
          {isPlaying ? "▶ Playing" : "⏸ Paused"}
        </div>
      </div>

      {/* 右侧：代码编辑器 (40%) */}
      <div className="w-full lg:w-[40%] h-[50vh] lg:h-full border-l border-gray-700">
        <div className="h-full">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            value={currentCode}
            options={getEditorOptions()}
            onMount={(editor, monaco) => {
              // 保存编辑器实例和 monaco 命名空间
              editorRef.current = { editor, monaco };
              
              // 添加高亮样式
              const style = document.createElement("style");
              style.textContent = `
                .highlight-line {
                  background-color: rgba(59, 130, 246, 0.3) !important;
                }
              `;
              document.head.appendChild(style);
              
              // 初始高亮
              setTimeout(() => updateHighlight(), 100);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

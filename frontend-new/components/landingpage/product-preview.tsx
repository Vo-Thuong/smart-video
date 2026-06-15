"use client";
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  RotateCw,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";

export const ProductPreview = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) setProgress((current / duration) * 100);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  return (
    <section id="product-preview">
      <div className="relative mt-10 max-w-5xl mx-auto p-4 lg:p-6">
        {/* Hiệu ứng Glow */}
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/15 blur-[100px] rounded-full -z-10" />

        <div className="rounded-3xl border border-border bg-card/40 p-3 backdrop-blur-xl shadow-2xl">
          <div
            className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-border/50 relative group cursor-pointer"
            onClick={() => togglePlay()}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop
              playsInline
              // Đã bỏ 'muted' để có âm thanh
              src="/assets/video/Recording.mp4"
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Nút Play lớn giữa màn hình (chỉ hiện khi đang dừng) */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <PlayCircle className="w-20 h-20 text-white/80 drop-shadow-2xl transition-transform group-hover:scale-110" />
              </div>
            )}

            {/* Thanh Control Bar phía dưới */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* 1. Thanh tiến trình (Progress Bar) */}
              <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* 2. Hàng nút điều khiển phía dưới thanh progress */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  {/* Nút Play/Pause nhỏ */}
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isPlaying ? (
                      <PauseCircle className="w-6 h-6" />
                    ) : (
                      <PlayCircle className="w-6 h-6" />
                    )}
                  </button>

                  {/* Nút Tua lùi 10s nhỏ gọn */}
                  <button
                    onClick={(e) => handleSeek(-10, e)}
                    className="flex items-center gap-1 text-white/80 hover:text-white transition-all active:scale-90"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-[10px] font-medium">10s</span>
                  </button>

                  {/* Nút Tua tới 10s nhỏ gọn */}
                  <button
                    onClick={(e) => handleSeek(10, e)}
                    className="flex items-center gap-1 text-white/80 hover:text-white transition-all active:scale-90"
                  >
                    <span className="text-[10px] font-medium">10s</span>
                    <RotateCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Indicator âm thanh (nhắc User là có tiếng) */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-white/60" />
                  <div className="text-[10px] text-white/60 font-mono uppercase tracking-widest">
                    Smart Video Engine
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

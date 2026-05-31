"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Bookmark } from "lucide-react";
import { SaveVideoModal, VideoInfo } from "./save-video-modal";
import { useLang } from "@/lib/i18n";

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { t } = useLang();

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const id = extractVideoId(trimmed);
    if (!id) {
      setError(t.dashboard.urlInput.invalidUrl);
      return;
    }

    setError(null);
    setVideoInfo({
      videoId: id,
      youtubeUrl: trimmed,
      title: "Đang tải...",
      thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    });

    // Lấy title + thumbnail từ YouTube oEmbed (không cần API key)
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        setVideoInfo((prev) =>
          prev ? { ...prev, title: data.title, thumbnail: data.thumbnail_url } : prev
        );
      }
    } catch {
      // oEmbed thất bại, giữ title mặc định
    }
  };

  return (
    <div className="space-y-4">
      {/* URL input bar */}
      <div className="flex items-center gap-2 p-2 rounded-full border border-white/10 bg-[#1C1132]">
        <div className="flex-1 h-12 bg-[#2D1F47] rounded-full px-6 flex items-center">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t.dashboard.urlInput.placeholder}
            className="w-full bg-transparent border-none outline-none shadow-none text-white placeholder:text-gray-400 focus:ring-0"
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="rounded-full bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold px-8 h-12"
        >
          {t.dashboard.urlInput.start}
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm px-4">{error}</p>}

      {videoInfo && (
        <div className="rounded-xl overflow-hidden bg-[#1C1132] border border-white/10">
          {/* YouTube iframe */}
          <div className="relative w-full aspect-video">
            <iframe
              key={videoInfo.videoId}
              src={`https://www.youtube.com/embed/${videoInfo.videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Action panel */}
          <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-white font-medium text-sm line-clamp-1 flex-1 min-w-0">
              {videoInfo.title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                className="rounded-full border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 gap-2 h-9 px-4"
                onClick={() =>
                  router.push(
                    `/dashboard/practice/${videoInfo.videoId}?title=${encodeURIComponent(videoInfo.title)}`
                  )
                }
              >
                <BookOpen className="w-4 h-4" />
                {t.dashboard.urlInput.practice}
              </Button>
              <Button
                className="rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-2 h-9 px-4"
                onClick={() => setShowModal(true)}
              >
                <Bookmark className="w-4 h-4" />
                {t.dashboard.urlInput.saveVideo}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showModal && videoInfo && (
        <SaveVideoModal
          videoInfo={videoInfo}
          onClose={() => setShowModal(false)}
          onSaved={() => setShowModal(false)}
        />
      )}
    </div>
  );
}




"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, BookOpen, Loader2, RefreshCw, Sparkles } from "lucide-react";

interface RecommendedVideo {
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  views: number;
  url: string;
}

export function VideoRecommendations() {
  const router = useRouter();
  const [videos, setVideos] = useState<RecommendedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVideos(data.videos);
      else setError("Không thể tải gợi ý.");
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00E5FF]" />
          Video gợi ý cho bạn
        </h2>
        <button
          onClick={() => fetchRecommendations(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition disabled:opacity-40"
          title="Tải lại gợi ý"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 className="w-7 h-7 animate-spin text-[#00E5FF]" />
          <p className="text-sm">AI đang tìm video phù hợp với bạn...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-gray-500 text-sm">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          <p>Chưa có gợi ý. Hãy hoàn thành khảo sát để nhận gợi ý phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {videos.map((video) => (
            <div
              key={video.youtubeId}
              className="bg-[#1C1132] border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-colors flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#2D1F47] flex-shrink-0">
                {video.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                {/* Play overlay */}
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play className="w-10 h-10 text-white fill-white" />
                </a>
                {/* Duration badge */}
                {video.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {video.duration}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1 gap-1.5">
                <p className="text-white text-xs font-medium line-clamp-2 flex-1 leading-snug">{video.title}</p>
                {video.channel && (
                  <p className="text-gray-500 text-[11px] truncate">{video.channel}</p>
                )}

                {/* Action */}
                <button
                  onClick={() =>
                    router.push(`/dashboard/practice/${video.youtubeId}?title=${encodeURIComponent(video.title)}`)
                  }
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-medium transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Luyện tập
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

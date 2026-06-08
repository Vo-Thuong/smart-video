"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Play, BookOpen, Loader2, RefreshCw, Sparkles, Crown, Lock, Search, X, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";

const FREE_LIMIT = 8;
const PRO_LIMIT = 20;

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
  const { t } = useLang();
  const r = t.dashboard.recommendations;
  const [videos, setVideos] = useState<RecommendedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Pro search state
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RecommendedVideo[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [queriesUsed, setQueriesUsed] = useState<string[]>([]);
  const [showQueries, setShowQueries] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Đọc is_premium từ user object (chính xác theo tài khoản đang đăng nhập)
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setIsPro(!!user.is_premium);
      }
    } catch {}
  }, []);

  const limit = isPro ? PRO_LIMIT : FREE_LIMIT;

  const fetchRecommendations = async (isRefresh = false, overrideLimit?: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    const effectiveLimit = overrideLimit ?? limit;
    try {
      const res = await fetch(`http://localhost:5000/api/recommendations?limit=${effectiveLimit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVideos(data.videos);
      else setError(r.loadError);
    } catch {
      setError(r.connectError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Đọc is_premium từ user object để tránh dùng cache cũ
    let pro = false;
    try {
      const raw = localStorage.getItem("user");
      if (raw) pro = !!JSON.parse(raw).is_premium;
    } catch {}
    setIsPro(pro);
    fetchRecommendations(false, pro ? PRO_LIMIT : FREE_LIMIT);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setSearching(true);
    setSearchError("");
    setSearchResults([]);
    setQueriesUsed([]);
    setSearchedKeyword(q);
    setShowQueries(false);
    try {
      const res = await fetch(
        `http://localhost:5000/api/recommendations/search?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.videos);
        setQueriesUsed(data.queriesUsed || []);
      } else {
        setSearchError(data.message || r.noResults);
      }
    } catch {
      setSearchError(r.connectError);
    } finally {
      setSearching(false);
    }
  };

  const openSearch = () => {
    setSearchMode(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchedKeyword("");
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchedKeyword("");
  };

  // Video card component (reused in both modes)
  const VideoCard = ({ video }: { video: RecommendedVideo }) => (
    <div className="bg-[#1C1132] border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-colors flex flex-col">
      <div className="relative aspect-video bg-[#2D1F47] flex-shrink-0">
        {video.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-600" />
          </div>
        )}
        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Play className="w-10 h-10 text-white fill-white" />
        </a>
        {video.duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-white text-xs font-medium line-clamp-2 flex-1 leading-snug">{video.title}</p>
        {video.channel && (
          <p className="text-gray-500 text-[11px] truncate">{video.channel}</p>
        )}
        <button
          onClick={() => router.push(`/dashboard/practice/${video.youtubeId}?title=${encodeURIComponent(video.title)}`)}
          className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-medium transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {r.practice}
        </button>
      </div>
    </div>
  );

  return (
    <section>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {searchMode ? (
            <button
              onClick={closeSearch}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}
          <h2 className="text-xl font-bold text-white flex items-center gap-2 truncate">
            <Sparkles className="w-5 h-5 text-[#00E5FF] flex-shrink-0" />
            {searchMode
              ? searchedKeyword
                ? <>{r.searchResults} <span className="text-[#00E5FF]">{searchedKeyword}</span></>
                : r.searchTitle
              : r.title
            }
          </h2>
          {!searchMode && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
              isPro
                ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
                : "bg-white/8 text-white/40 border-white/10"
            }`}>
              {isPro
                ? r.proLabel.replace("{n}", String(PRO_LIMIT))
                : r.freeLabel.replace("{n}", String(FREE_LIMIT))
              }
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Pro search button */}
          {isPro && !searchMode && (
            <button
              onClick={openSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#a78bfa]/40 bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#c4b5fd] text-sm font-medium transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              {r.search}
            </button>
          )}
          {/* Free users: teaser */}
          {!isPro && !searchMode && (
            <button
              onClick={() => router.push("/dashboard/upgrade")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-500 text-sm font-medium cursor-pointer hover:border-[#a78bfa]/40 hover:text-[#c4b5fd] transition-all"
              title={r.searchTooltip}
            >
              <Lock className="w-3 h-3" />
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
          {!searchMode && (
            <button
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition disabled:opacity-40"
              title={r.refreshTooltip}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {r.refresh}
            </button>
          )}
        </div>
      </div>

      {/* ── Pro Search Panel ── */}
      {searchMode && (
        <div className="mb-6">
          {/* Search input */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-[#1C1132] border border-[#a78bfa]/30 focus-within:border-[#a78bfa] rounded-xl px-4 h-11 transition-colors">
              <Search className="w-4 h-4 text-[#a78bfa] flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={r.searchPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-500 focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-600 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-5 h-11 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] disabled:opacity-40 text-white font-semibold text-sm flex items-center gap-2 transition-all flex-shrink-0"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? r.searching : r.search}
            </button>
          </div>

          {/* AI queries info */}
          {queriesUsed.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowQueries((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition"
              >
                <Sparkles className="w-3 h-3 text-[#a78bfa]" />
                {r.aiQueries.replace("{n}", String(queriesUsed.length))}
                <span className="text-[#a78bfa]">{showQueries ? "▲" : "▼"}</span>
              </button>
              {showQueries && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {queriesUsed.map((q, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-[#2D1F47] border border-white/10 text-gray-400"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search results */}
          {searching ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin text-[#a78bfa]" />
              <p className="text-sm">AI is generating queries and searching YouTube...</p>
            </div>
          ) : searchError ? (
            <div className="text-center py-10 text-red-400 text-sm">{searchError}</div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {searchResults.map((video) => (
                <VideoCard key={video.youtubeId} video={video} />
              ))}
            </div>
          ) : searchedKeyword && !searching ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              {r.noResults}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 text-sm">
              <Search className="w-10 h-10 mx-auto mb-3 text-[#a78bfa]/30" />
              <p>Enter a topic and AI will find matching videos on YouTube</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["job interview", "IELTS listening", "travel English", "business email", "daily conversation"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSearchQuery(s); setTimeout(handleSearch, 50); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#2D1F47] border border-white/10 text-gray-400 hover:text-[#c4b5fd] hover:border-[#a78bfa]/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Recommendations (default mode) ── */}
      {!searchMode && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin text-[#00E5FF]" />
              <p className="text-sm">AI is finding videos for you...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-gray-500 text-sm">{error}</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              <p>No suggestions yet. Complete the onboarding survey to get personalized recommendations.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {videos.slice(0, limit).map((video) => (
                  <VideoCard key={video.youtubeId} video={video} />
                ))}
              </div>

              {/* Upgrade prompt for free users */}
              {!isPro && videos.length > FREE_LIMIT && (
                <div className="mt-6 relative rounded-2xl border border-[#a78bfa]/30 bg-gradient-to-r from-[#a78bfa]/10 to-[#6366f1]/10 p-5 flex flex-col sm:flex-row items-center gap-4 overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#a78bfa]/5 to-transparent" />
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-white font-semibold text-sm">
                      Còn {videos.length - FREE_LIMIT} video đang bị ẩn
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Nâng cấp Pro để xem tối đa {PRO_LIMIT} gợi ý AI mỗi lần.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/upgrade")}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:opacity-90 text-white text-sm font-semibold transition-opacity"
                  >
                    <Crown className="w-4 h-4" />
                    Nâng cấp Pro
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}


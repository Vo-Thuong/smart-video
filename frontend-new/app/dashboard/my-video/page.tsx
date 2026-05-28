"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Trash2, BookOpen, Play, FolderPlus, Check, Plus, X, Clock, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VideoToolbar } from "@/components/my-video/video-toolbar";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface SavedVideo {
  _id: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  thumbnail: string;
  isFavorite: boolean;
  categoryId: Category | null;
  createdAt: string;
  progressTime?: number;
  progressSegment?: string;
  lastPracticed?: string | null;
}

const PRESET_COLORS = [
  "#00E5FF", "#7C3AED", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#3B82F6", "#84CC16",
];

export default function MyVideoPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<"all" | "favorite" | string>("all");
  const [loading, setLoading] = useState(true);

  // Collection dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [catLoading, setCatLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchVideos = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const params = new URLSearchParams();
      if (filter === "favorite") params.set("favorite", "true");
      else if (filter !== "all") params.set("categoryId", filter);

      const res = await fetch(`http://localhost:5000/api/saved-video?${params}`, {
        headers: { ...authHeader, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch {
      toast.error("Không thể tải danh sách video");
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/category", {
      headers: { ...authHeader, "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.categories); })
      .catch(() => {});
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    if (openDropdownId) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdownId]);

  function closeDropdown() {
    setOpenDropdownId(null);
    setCreatingNew(false);
    setNewCatName("");
    setNewCatColor(PRESET_COLORS[0]);
  }

  const toggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/saved-video/${id}/favorite`, {
        method: "PATCH",
        headers: { ...authHeader, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isFavorite: data.isFavorite } : v))
        );
      }
    } catch {
      toast.error("Lỗi khi cập nhật yêu thích");
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/saved-video/${id}`, {
        method: "DELETE",
        headers: { ...authHeader, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        toast.success("Đã xóa video");
      }
    } catch {
      toast.error("Lỗi khi xóa video");
    }
  };

  const assignCategory = async (videoId: string, categoryId: string | null) => {
    try {
      const res = await fetch(`http://localhost:5000/api/saved-video/${videoId}/category`, {
        method: "PATCH",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v._id === videoId ? { ...v, categoryId: data.video.categoryId } : v))
        );
        toast.success(categoryId ? "Đã thêm vào bộ sưu tập" : "Đã xóa khỏi bộ sưu tập");
        closeDropdown();
      }
    } catch {
      toast.error("Lỗi khi cập nhật bộ sưu tập");
    }
  };

  const createCategoryAndAssign = async (videoId: string) => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      // Create category
      const res = await fetch("http://localhost:5000/api/category", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      const newCat: Category = data.category;
      setCategories((prev) => [...prev, newCat]);
      // Assign to video
      await assignCategory(videoId, newCat._id);
    } catch {
      toast.error("Lỗi khi tạo bộ sưu tập");
    } finally {
      setCatLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-2">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Your Video Sets</h1>
        <p className="text-gray-300">Select a video and start to practice</p>
      </div>

      <VideoToolbar
        categories={categories}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="animate-spin w-8 h-8 border-4 border-white/20 border-t-[#00E5FF] rounded-full" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Chưa có video nào được lưu</p>
          <p className="text-sm mt-1">Paste URL YouTube ở Dashboard để lưu video đầu tiên</p>
        </div>
      ) : (
        <>
          {/* ── Continue Watching ── */}
          {filter === "all" && (() => {
            const inProgress = videos.filter((v) => (v.progressTime ?? 0) > 3);
            if (inProgress.length === 0) return null;
            return (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00E5FF]" /> Tiếp tục luyện tập
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {inProgress.map((video) => {
                    const pct = Math.min(100, Math.round(((video.progressTime ?? 0) / 600) * 100)); // rough estimate
                    const mins = Math.floor((video.progressTime ?? 0) / 60);
                    const secs = Math.floor((video.progressTime ?? 0) % 60);
                    return (
                      <div
                        key={video._id}
                        className="flex-shrink-0 w-56 bg-[#1C1132] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#00E5FF]/40 transition-all group"
                        onClick={() =>
                          router.push(`/dashboard/practice/${video.youtubeId}?title=${encodeURIComponent(video.title)}`)
                        }
                      >
                        <div className="relative aspect-video">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-[#00E5FF] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="px-3 py-2">
                          <p className="text-white text-xs font-medium line-clamp-1">{video.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Đến: {mins}:{secs.toString().padStart(2, "0")}
                            {video.progressSegment && (
                              <span className="block truncate italic mt-0.5 text-gray-600">&ldquo;{video.progressSegment}&rdquo;</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-[#1C1132] border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#2D1F47]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-12 h-12 text-white fill-white" />
                </a>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-white text-sm font-medium line-clamp-2">{video.title}</p>

                {/* Category badge */}
                {video.categoryId && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${video.categoryId.color}20`,
                      color: video.categoryId.color,
                      border: `1px solid ${video.categoryId.color}40`,
                    }}
                  >
                    {video.categoryId.name}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  {/* Practice button */}
                  <button
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-medium transition-colors"
                    title="Luyện tập"
                    onClick={() =>
                      router.push(
                        `/dashboard/practice/${video.youtubeId}?title=${encodeURIComponent(video.title)}`
                      )
                    }
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Luyện tập
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Add to collection */}
                    <div className="relative" ref={openDropdownId === video._id ? dropdownRef : undefined}>
                      <button
                        onClick={() =>
                          openDropdownId === video._id ? closeDropdown() : setOpenDropdownId(video._id)
                        }
                        className={`p-1.5 rounded-full transition-colors ${
                          video.categoryId
                            ? "text-purple-400 hover:bg-purple-400/10"
                            : "text-gray-500 hover:text-purple-400 hover:bg-purple-400/10"
                        }`}
                        title="Thêm vào bộ sưu tập"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>

                      {/* Dropdown */}
                      {openDropdownId === video._id && (
                        <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1C1132] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden">
                          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bộ sưu tập</span>
                            <button onClick={closeDropdown} className="text-gray-500 hover:text-white">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Remove from collection */}
                          {video.categoryId && (
                            <button
                              onClick={() => assignCategory(video._id, null)}
                              className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              Xóa khỏi bộ sưu tập
                            </button>
                          )}

                          {/* Existing categories */}
                          <div className="max-h-36 overflow-y-auto">
                            {categories.length === 0 && (
                              <p className="px-3 py-3 text-xs text-gray-500 text-center">Chưa có bộ sưu tập nào</p>
                            )}
                            {categories.map((cat) => (
                              <button
                                key={cat._id}
                                onClick={() => assignCategory(video._id, cat._id)}
                                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-sm text-white truncate flex-1">{cat.name}</span>
                                {video.categoryId?._id === cat._id && (
                                  <Check className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Create new */}
                          <div className="border-t border-white/10">
                            {!creatingNew ? (
                              <button
                                onClick={() => setCreatingNew(true)}
                                className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors text-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Tạo bộ mới
                              </button>
                            ) : (
                              <div className="p-3 space-y-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={newCatName}
                                  onChange={(e) => setNewCatName(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && createCategoryAndAssign(video._id)}
                                  placeholder="Tên bộ sưu tập..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-[#00E5FF]/50"
                                />
                                <div className="flex gap-1 flex-wrap">
                                  {PRESET_COLORS.map((c) => (
                                    <button
                                      key={c}
                                      onClick={() => setNewCatColor(c)}
                                      className="w-5 h-5 rounded-full border-2 transition-all"
                                      style={{
                                        backgroundColor: c,
                                        borderColor: newCatColor === c ? "white" : "transparent",
                                      }}
                                    />
                                  ))}
                                </div>
                                <button
                                  onClick={() => createCategoryAndAssign(video._id)}
                                  disabled={catLoading || !newCatName.trim()}
                                  className="w-full py-1.5 rounded-lg bg-[#00E5FF] text-black text-xs font-semibold disabled:opacity-50 hover:bg-[#00BCCC] transition-colors"
                                >
                                  {catLoading ? "Đang tạo..." : "Tạo & Thêm"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavorite(video._id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        video.isFavorite
                          ? "text-red-400 hover:bg-red-400/10"
                          : "text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${video.isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => deleteVideo(video._id)}
                      className="p-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          </>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Video as VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

const API = "http://localhost:5000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Author {
  _id: string;
  username: string;
  fullname: string;
  avatar: string;
}

interface Post {
  _id: string;
  userId: Author;
  postType?: "video" | "vocab";
  caption: string;
  // video post fields
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  thumbnail: string;
  sourceType: "saved" | "favorite" | "practiced";
  // vocab post fields
  vocabWords?: { word: string; phonetic?: string; translation: string; example?: string }[];
  visibility?: "public" | "friends";
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: Author;
  text: string;
  createdAt: string;
}

interface SavedVideo {
  _id: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  thumbnail: string;
  isFavorite: boolean;
  lastPracticed: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function sourceLabel(type: string) {
  if (type === "favorite") return { text: "❤️ Đã yêu thích", cls: "bg-red-500/15 text-red-400 border-red-500/30" };
  if (type === "practiced") return { text: "🎯 Đã luyện tập", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  return { text: "📌 Đã lưu", cls: "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30" };
}

function Avatar({ user, size = 10 }: { user: Author; size?: number }) {
  const initials = user.fullname.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const cls = `w-${size} h-${size} rounded-full object-cover flex-shrink-0`;
  if (user.avatar) {
    const src = user.avatar.startsWith("/uploads")
      ? `http://localhost:5000${user.avatar}`
      : user.avatar;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={user.fullname} className={cls} />;
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B2FBE] flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ fontSize: size * 1.4 }}
    >
      {initials}
    </div>
  );
}

// ─── Comment section ──────────────────────────────────────────────────────────

function CommentSection({
  postId,
  initialCount,
  token,
  me,
  onCountChange,
}: {
  postId: string;
  initialCount: number;
  token: string;
  me: Author | null;
  onCountChange: (delta: number) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setComments(data.comments);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [postId, token]);

  useEffect(() => { load(); }, [load]);

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setText("");
        onCountChange(1);
      } else {
        toast.error(data.message);
      }
    } finally {
      setSending(false);
    }
  }

  async function deleteComment(id: string) {
    try {
      const res = await fetch(`${API}/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== id));
        onCountChange(-1);
      }
    } catch {
      toast.error("Không thể xóa bình luận.");
    }
  }

  return (
    <div className="border-t border-white/10 px-5 py-4 space-y-4">
      {loading && !loaded && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
        </div>
      )}

      {loaded && comments.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-1">Chưa có bình luận nào.</p>
      )}

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-2.5 group">
            <Avatar user={c.userId} size={8} />
            <div className="flex-1 min-w-0">
              <div className="bg-white/5 rounded-2xl px-3 py-2">
                <p className="text-white text-xs font-semibold">{c.userId.fullname}</p>
                <p className="text-gray-200 text-sm mt-0.5 break-words">{c.text}</p>
              </div>
              <p className="text-gray-600 text-xs mt-1 pl-1">{timeAgo(c.createdAt)}</p>
            </div>
            {me?._id === c.userId._id && (
              <button
                onClick={() => deleteComment(c._id)}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition mt-1 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendComment} className="flex gap-2 items-center">
        {me && <Avatar user={me} size={8} />}
        <div className="flex-1 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
            maxLength={500}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-[#00E5FF]/50 transition"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00E5FF] disabled:opacity-40 hover:text-white transition"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  token,
  me,
  onDelete,
}: {
  post: Post;
  token: string;
  me: Author | null;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isVocab = post.postType === "vocab";
  const badge = isVocab
    ? { text: "📚 Từ vựng", cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" }
    : sourceLabel(post.sourceType);

  async function toggleLike() {
    // Optimistic update
    setLiked((v) => !v);
    setLikesCount((n) => liked ? n - 1 : n + 1);
    try {
      const res = await fetch(`${API}/posts/${post._id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        setLiked((v) => !v);
        setLikesCount((n) => liked ? n + 1 : n - 1);
      }
    } catch {
      setLiked((v) => !v);
      setLikesCount((n) => liked ? n + 1 : n - 1);
    }
  }

  async function saveVideo() {
    if (saved || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/posts/${post._id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        toast.success("Đã lưu video vào thư viện của bạn!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Không thể lưu video.");
    } finally {
      setSaving(false);
    }
  }

  function sharePost() {
    const url = `${window.location.origin}/dashboard/feed?post=${post._id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Đã sao chép liên kết!"));
  }

  async function deletePost() {
    try {
      const res = await fetch(`${API}/posts/${post._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        onDelete(post._id);
        toast.success("Đã xóa bài đăng.");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Không thể xóa bài đăng.");
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Author row */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Avatar user={post.userId} size={10} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{post.userId.fullname}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-500 text-xs">@{post.userId.username} · {timeAgo(post.createdAt)}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.text}</span>
          </div>
        </div>
        {me?._id === post.userId._id && (
          <button
            onClick={deletePost}
            className="text-gray-600 hover:text-red-400 transition"
            title="Xóa bài đăng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="px-5 pb-3 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {post.caption}
        </p>
      )}

      {/* ── Vocab card ── */}
      {isVocab && post.vocabWords && post.vocabWords.length > 0 && (
        <div className="mx-4 mb-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
          <div className="px-4 py-2.5 bg-purple-500/10 border-b border-purple-500/15 flex items-center gap-2">
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">📚 Bộ từ vựng · {post.vocabWords.length} từ</span>
          </div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {post.vocabWords.map((w, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-white font-semibold text-sm">{w.word}</span>
                    {w.phonetic && <span className="text-gray-500 text-xs">{w.phonetic}</span>}
                  </div>
                  <p className="text-purple-300 text-xs mt-0.5">{w.translation}</p>
                  {w.example && (
                    <p className="text-gray-500 text-xs mt-0.5 italic line-clamp-1">&ldquo;{w.example}&rdquo;</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Video thumbnail (video posts only) ── */}
      {!isVocab && (
        <div
          className="relative mx-4 mb-4 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() =>
            router.push(`/dashboard/practice/${post.youtubeId}?title=${encodeURIComponent(post.title)}`)
          }
        >
          {post.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-[#2D1B4E] flex items-center justify-center">
              <VideoIcon className="w-12 h-12 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <div className="bg-[#00E5FF] rounded-full px-5 py-2.5 flex items-center gap-2 text-black font-semibold text-sm shadow-lg">
              <PlayCircle className="w-5 h-5" />
              Luyện tập ngay
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <p className="text-white text-sm font-medium line-clamp-2">{post.title}</p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 pb-3 border-b border-white/10">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
            liked
              ? "text-red-400 bg-red-400/10"
              : "text-gray-400 hover:text-red-400 hover:bg-red-400/10"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition"
        >
          <MessageCircle className="w-4 h-4" />
          {commentsCount > 0 && <span>{commentsCount}</span>}
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={sharePost}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 transition"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>

        <div className="flex-1" />

        {!isVocab && (
          <button
            onClick={saveVideo}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 ${
              saved
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10"
            }`}
            title="Lưu video vào thư viện"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{saved ? "Đã lưu" : "Lưu video"}</span>
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post._id}
          initialCount={commentsCount}
          token={token}
          me={me}
          onCountChange={(delta) => setCommentsCount((n) => Math.max(0, n + delta))}
        />
      )}
    </div>
  );
}

// ─── Create post modal ────────────────────────────────────────────────────────

function CreatePostModal({
  token,
  onCreated,
  onClose,
}: {
  token: string;
  onCreated: (post: Post) => void;
  onClose: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [myVideos, setMyVideos] = useState<SavedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null);
  const [sourceType, setSourceType] = useState<"saved" | "favorite" | "practiced">("saved");
  const [submitting, setSubmitting] = useState(false);
  const [videosLoading, setVideosLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/saved-video`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMyVideos(d.videos);
      })
      .finally(() => setVideosLoading(false));
  }, [token]);

  const filtered = myVideos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVideo) { toast.error("Vui lòng chọn một video."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          caption,
          youtubeId: selectedVideo.youtubeId,
          youtubeUrl: selectedVideo.youtubeUrl,
          title: selectedVideo.title,
          thumbnail: selectedVideo.thumbnail,
          sourceType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.post);
        toast.success("Đã đăng bài thành công!");
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Không thể tạo bài đăng.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1C1132] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-semibold text-base">Tạo bài đăng mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Bạn đang nghĩ gì? Chia sẻ cảm nhận về video này..."
              rows={3}
              maxLength={1000}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#00E5FF]/50 transition placeholder-gray-500"
            />

            {/* Source type */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Loại chia sẻ</p>
              <div className="flex gap-2 flex-wrap">
                {([
                  { v: "saved", label: "📌 Đã lưu" },
                  { v: "favorite", label: "❤️ Yêu thích" },
                  { v: "practiced", label: "🎯 Đã luyện tập" },
                ] as const).map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSourceType(v)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      sourceType === v
                        ? "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10"
                        : "border-white/15 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video picker */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Chọn video từ thư viện</p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm video..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00E5FF]/40 transition placeholder-gray-600"
              />
              {videosLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Không có video nào trong thư viện.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {filtered.map((v) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setSelectedVideo(v)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl border transition text-left ${
                        selectedVideo?._id === v._id
                          ? "border-[#00E5FF] bg-[#00E5FF]/10"
                          : "border-white/5 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      {v.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.thumbnail} alt={v.title} className="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <VideoIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium line-clamp-2">{v.title}</p>
                        {v.isFavorite && <span className="text-xs text-red-400">❤️ Yêu thích</span>}
                      </div>
                      {selectedVideo?._id === v._id && (
                        <CheckCircle2 className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/10 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-white/20 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-white/5 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedVideo}
              className="flex-1 bg-[#00E5FF] hover:bg-[#00BCCC] disabled:opacity-50 text-black font-semibold text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Feed page ───────────────────────────────────────────────────────────

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [me, setMe] = useState<Author | null>(null);
  const token = useRef<string>("");

  useEffect(() => {
    token.current = localStorage.getItem("token") ?? "";
    // Load current user
    if (token.current) {
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token.current}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setMe(d.user);
        });
    }
  }, []);

  const loadPosts = useCallback(async (pageNum: number, replace = false) => {
    if (!token.current) { setError("Bạn chưa đăng nhập."); setLoading(false); return; }
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`${API}/posts?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token.current}` },
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setPosts((prev) => replace ? data.posts : [...prev, ...data.posts]);
      setHasMore(pageNum < data.pages);
    } catch {
      setError("Không thể tải bảng tin.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPosts(1, true); }, [loadPosts]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadPosts(next);
  }

  function handleCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bảng tin</h1>
          <p className="text-gray-400 mt-1 text-sm">Khám phá và chia sẻ video học tiếng Anh với cộng đồng.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Đăng bài
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải bảng tin...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <VideoIcon className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <p className="text-white font-semibold">Bảng tin đang trống</p>
            <p className="text-gray-500 text-sm mt-1">Hãy là người đầu tiên chia sẻ video!</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-[#00E5FF] text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#00BCCC] transition"
          >
            <Plus className="w-4 h-4" />
            Đăng bài đầu tiên
          </button>
        </div>
      )}

      {/* Posts */}
      {!loading && posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          token={token.current}
          me={me}
          onDelete={handleDelete}
        />
      ))}

      {/* Load more */}
      {!loading && hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm px-5 py-2.5 border border-white/15 rounded-xl hover:border-white/30 transition disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            {loadingMore ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}

      {/* Create post modal */}
      {showCreate && (
        <CreatePostModal
          token={token.current}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

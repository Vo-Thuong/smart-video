"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Video,
  BookOpen,
  Loader2,
  Play,
  Volume2,
  Trash2,
  FolderOpen,
  Share2,
  Globe,
  Users,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface SavedVideo {
  _id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  createdAt: string;
}

interface VocabItem {
  _id: string;
  word: string;
  phonetic: string;
  translation: string;
  example: string;
  videoTitle: string;
  createdAt: string;
  categoryId?: string | { _id: string };
}

interface Friend {
  _id: string;
  username: string;
  fullname: string;
  avatar: string;
}

interface ShareDialog {
  type: "video" | "vocab";
  // multi-word share (all collection vocabs)
  vocabWords?: {
    word: string;
    phonetic?: string;
    translation: string;
    example?: string;
  }[];
  // single video
  youtubeId?: string;
  youtubeUrl?: string;
  title?: string;
  thumbnail?: string;
  // single vocab (kept for fallback)
  word?: string;
  phonetic?: string;
  translation?: string;
  example?: string;
  caption: string;
  shareMode: "feed" | "friends";
  friends: Friend[];
  loadingFriends: boolean;
  selectedFriends: string[];
  saving: boolean;
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPos(translation: string): string {
  const match = translation?.match(/^\(([^)]+)\)/);
  return match ? match[1] : "";
}

function speakWord(word: string) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// ─── Collection Vocab Card ─────────────────────────────────────────────────────

function CollectionVocabCard({
  item,
  onShare,
  onDelete,
}: {
  item: {
    _id: string;
    word: string;
    phonetic?: string;
    translation: string;
    example?: string;
    videoTitle?: string;
  };
  onShare: (v: {
    _id: string;
    word: string;
    phonetic?: string;
    translation: string;
    example?: string;
  }) => void;
  onDelete: (id: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const pos = extractPos(item.translation);

  const CardActions = () => (
    <div
      className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onShare(item)}
        className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-[#7C3AED]/20 hover:text-[#7C3AED] transition-colors"
        title="Chia sẻ từ vựng"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
      {deleteConfirm ? (
        <button
          onClick={() => onDelete(item._id)}
          className="px-2.5 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold transition-colors"
        >
          Xóa?
        </button>
      ) : (
        <button
          onClick={() => setDeleteConfirm(true)}
          onBlur={() => setTimeout(() => setDeleteConfirm(false), 200)}
          className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          title="Xóa"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full" style={{ perspective: "1000px" }}>
      <div
        className="h-full transition-transform duration-500 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          display: "grid",
          gridTemplateAreas: '"card"',
        }}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* Front */}
        <div
          className="bg-[#2D1F47] border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-2 transition-colors min-h-[220px]"
          style={{ gridArea: "card", backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white leading-tight">
                {item.word}
              </h3>
              {item.phonetic && (
                <p className="text-sm text-[#00E5FF] mt-0.5">{item.phonetic}</p>
              )}
              {pos && (
                <span className="mt-1.5 inline-block text-[11px] italic text-[#7C3AED] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-full">
                  {pos}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(item.word);
              }}
              className="p-2.5 rounded-xl bg-[#1C1132] border border-white/10 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors flex-shrink-0"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1" />

          <p className="text-[11px] text-gray-600">Nhấp để xem nghĩa →</p>

          <div onClick={(e) => e.stopPropagation()}>
            <CardActions />
          </div>
        </div>

        {/* Back */}
        <div
          className="bg-[#1C1132] border border-[#7C3AED]/40 rounded-2xl p-5 flex flex-col gap-3 min-h-[220px]"
          style={{
            gridArea: "card",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              Nghĩa
            </p>
            <p className="text-sm text-white leading-relaxed">
              {item.translation}
            </p>
          </div>
          {item.example && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                Ví dụ
              </p>
              <p className="text-sm text-[#00E5FF] italic leading-relaxed">
                &ldquo;{item.example}&rdquo;
              </p>
            </div>
          )}
          {item.videoTitle && (
            <p className="text-[10px] text-gray-600 mt-auto">
              📹 {item.videoTitle}
            </p>
          )}

          <div className="flex-1" />

          <div onClick={(e) => e.stopPropagation()}>
            <CardActions />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [vocabs, setVocabs] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"video" | "vocab">("video");
  const [shareDialog, setShareDialog] = useState<ShareDialog | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    Authorization: `Bearer ${token ?? ""}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("http://localhost:5000/api/category", { headers }).then((r) =>
        r.json(),
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/saved-video?categoryId=${id}`,
        { headers },
      ).then((r) => r.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/vocabulary?categoryId=${id}`,
        { headers },
      ).then((r) => r.json()),
    ])
      .then(([catData, videoData, vocabData]) => {
        if (catData.success) {
          const found = catData.categories.find((c: Category) => c._id === id);
          setCategory(found ?? null);
        }
        if (videoData.success) setVideos(videoData.videos);
        if (vocabData.success) {
          setVocabs(vocabData.vocabulary);
        }
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [id, token]);

  const deleteVideo = async (videoId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/saved-video/${videoId}`,
        { method: "DELETE", headers },
      );
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Đã xóa video khỏi bộ sưu tập");
    } catch {
      toast.error("Lỗi khi xóa video");
    }
  };

  const deleteVocab = async (vocabId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/vocabulary/${vocabId}`,
        { method: "DELETE", headers },
      );
      setVocabs((prev) => prev.filter((v) => v._id !== vocabId));
      toast.success("Đã xóa từ vựng");
    } catch {
      toast.error("Lỗi khi xóa từ vựng");
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────────
  const openShareVideo = (v: SavedVideo) => {
    setShareDialog({
      type: "video",
      youtubeId: v.youtubeId,
      youtubeUrl: v.youtubeUrl,
      title: v.title,
      thumbnail: v.thumbnail,
      caption: "",
      shareMode: "feed",
      friends: [],
      loadingFriends: false,
      selectedFriends: [],
      saving: false,
    });
  };

  const openShareVocab = (v: VocabItem) => {
    setShareDialog({
      type: "vocab",
      vocabWords: [
        {
          word: v.word,
          phonetic: v.phonetic,
          translation: v.translation,
          example: v.example,
        },
      ],
      word: v.word,
      phonetic: v.phonetic,
      translation: v.translation,
      example: v.example,
      caption: "",
      shareMode: "feed",
      friends: [],
      loadingFriends: false,
      selectedFriends: [],
      saving: false,
    });
  };

  const openShareAllVocab = () => {
    if (vocabs.length === 0) return;
    setShareDialog({
      type: "vocab",
      vocabWords: vocabs.map((v) => ({
        word: v.word,
        phonetic: v.phonetic,
        translation: v.translation,
        example: v.example,
      })),
      caption: "",
      shareMode: "feed",
      friends: [],
      loadingFriends: false,
      selectedFriends: [],
      saving: false,
    });
  };

  const switchToFriends = () => {
    setShareDialog((prev) => {
      if (!prev) return prev;
      const next = { ...prev, shareMode: "friends" as const };
      if (prev.friends.length === 0 && !prev.loadingFriends) {
        next.loadingFriends = true;
        fetch("http://localhost:5000/api/friends/list", {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        })
          .then((r) => r.json())
          .then((d) => {
            const list: Friend[] = Array.isArray(d) ? d : [];
            setShareDialog(
              (p) => p && { ...p, friends: list, loadingFriends: false },
            );
          })
          .catch(() =>
            setShareDialog((p) => p && { ...p, loadingFriends: false }),
          );
      }
      return next;
    });
  };

  const submitShare = async () => {
    if (!shareDialog) return;
    if (
      shareDialog.shareMode === "friends" &&
      shareDialog.selectedFriends.length === 0
    ) {
      toast.error("Vui lòng chọn ít nhất 1 bạn bè");
      return;
    }
    setShareDialog((prev) => prev && { ...prev, saving: true });
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    };
    try {
      if (shareDialog.type === "video") {
        const res = await fetch("http://localhost:5000/api/posts", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            caption: shareDialog.caption,
            youtubeId: shareDialog.youtubeId,
            youtubeUrl: shareDialog.youtubeUrl,
            title: shareDialog.title,
            thumbnail: shareDialog.thumbnail,
            sourceType: "saved",
            visibility: shareDialog.shareMode === "feed" ? "public" : "friends",
            sharedWith:
              shareDialog.shareMode === "friends"
                ? shareDialog.selectedFriends
                : [],
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } else {
        const words =
          shareDialog.vocabWords ??
          (shareDialog.word
            ? [
                {
                  word: shareDialog.word,
                  phonetic: shareDialog.phonetic,
                  translation: shareDialog.translation,
                  example: shareDialog.example,
                },
              ]
            : []);
        const res = await fetch("http://localhost:5000/api/posts/vocab", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            caption: shareDialog.caption,
            vocabWords: words,
            visibility: shareDialog.shareMode === "feed" ? "public" : "friends",
            sharedWith:
              shareDialog.shareMode === "friends"
                ? shareDialog.selectedFriends
                : [],
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      }
      toast.success(
        shareDialog.shareMode === "feed"
          ? "Đã chia sẻ lên feed!"
          : "Đã chia sẻ cho bạn bè!",
      );
      setShareDialog(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi chia sẻ");
      setShareDialog((prev) => prev && { ...prev, saving: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {loading ? (
          <div className="h-8 w-40 bg-white/10 rounded-lg animate-pulse" />
        ) : category ? (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${category.color}20`,
                border: `1px solid ${category.color}40`,
              }}
            >
              <FolderOpen
                className="w-4 h-4"
                style={{ color: category.color }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{category.name}</h1>
              <p className="text-xs text-gray-500">
                {videos.length} video · {vocabs.length} từ vựng
              </p>
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-white">Bộ chủ đề</h1>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setTab("video")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "video"
              ? "bg-[#00E5FF] text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" /> Video ({videos.length})
        </button>
        <button
          onClick={() => setTab("vocab")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "vocab"
              ? "bg-[#7C3AED] text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Từ vựng ({vocabs.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
        </div>
      ) : tab === "video" ? (
        videos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Chưa có video nào trong bộ chủ đề này</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((v) => (
              <div
                key={v._id}
                className="bg-[#1C1132] border border-white/10 rounded-2xl overflow-hidden flex gap-0 group"
              >
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/practice/${v.youtubeId}?title=${encodeURIComponent(v.title)}`,
                    )
                  }
                  className="flex items-center gap-3 flex-1 p-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-24 h-16 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {v.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(v.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </button>
                {/* Action buttons */}
                <div className="flex flex-col border-l border-white/5">
                  <button
                    onClick={() => openShareVideo(v)}
                    className="flex-1 px-3 text-gray-500 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors flex items-center justify-center"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteVideo(v._id)}
                    className="flex-1 px-3 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center border-t border-white/5"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : vocabs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có từ vựng nào trong bộ chủ đề này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Share all button */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-500">
              {vocabs.length} từ vựng
            </span>
            <button
              onClick={openShareAllVocab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/40 text-[#9D5CF6] text-xs font-medium hover:bg-[#7C3AED]/25 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ toàn bộ {vocabs.length}{" "}
              từ
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vocabs.map((v) => (
              <CollectionVocabCard
                key={v._id}
                item={v}
                onShare={openShareVocab as any}
                onDelete={deleteVocab}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Share Dialog ── */}
      {shareDialog &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#1C1132] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#00E5FF]" />
                  <span className="text-sm font-semibold text-white">
                    Chia sẻ
                  </span>
                </div>
                <button
                  onClick={() => setShareDialog(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
                {/* Preview */}
                {shareDialog.type === "video" ? (
                  <div className="bg-[#2D1F47] rounded-xl overflow-hidden flex gap-3 items-center pr-3">
                    <img
                      src={shareDialog.thumbnail}
                      alt=""
                      className="w-20 h-14 object-cover flex-shrink-0"
                    />
                    <span className="text-sm text-white font-medium line-clamp-2">
                      {shareDialog.title}
                    </span>
                  </div>
                ) : shareDialog.vocabWords &&
                  shareDialog.vocabWords.length > 1 ? (
                  <div className="bg-[#2D1F47] rounded-xl px-4 py-3 flex flex-col gap-2 max-h-40 overflow-y-auto">
                    <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                      📚 {shareDialog.vocabWords.length} từ vựng
                    </span>
                    {shareDialog.vocabWords.map((w, i) => (
                      <div key={i} className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white">
                          {w.word}
                        </span>
                        {w.phonetic && (
                          <span className="text-xs text-gray-400">
                            {w.phonetic}
                          </span>
                        )}
                        <span className="text-xs text-[#00E5FF] truncate">
                          {w.translation}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2D1F47] rounded-xl px-4 py-3 flex flex-col gap-1">
                    <span className="text-base font-bold text-white">
                      {shareDialog.vocabWords?.[0]?.word ?? shareDialog.word}
                    </span>
                    {(shareDialog.vocabWords?.[0]?.phonetic ??
                      shareDialog.phonetic) && (
                      <span className="text-xs text-gray-400">
                        {shareDialog.vocabWords?.[0]?.phonetic ??
                          shareDialog.phonetic}
                      </span>
                    )}
                    {(shareDialog.vocabWords?.[0]?.translation ??
                      shareDialog.translation) && (
                      <span className="text-xs text-[#00E5FF]">
                        {shareDialog.vocabWords?.[0]?.translation ??
                          shareDialog.translation}
                      </span>
                    )}
                  </div>
                )}

                {/* Caption */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Caption
                  </label>
                  <textarea
                    value={shareDialog.caption}
                    onChange={(e) =>
                      setShareDialog(
                        (prev) => prev && { ...prev, caption: e.target.value },
                      )
                    }
                    rows={2}
                    placeholder="Viết caption... (tuỳ chọn)"
                    className="w-full bg-[#2D1F47] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 outline-none focus:border-[#7C3AED] resize-none transition-colors"
                  />
                </div>

                {/* Share mode */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Chia sẻ tới
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setShareDialog(
                          (prev) => prev && { ...prev, shareMode: "feed" },
                        )
                      }
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        shareDialog.shareMode === "feed"
                          ? "border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF]"
                          : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Globe className="w-4 h-4" /> Lên feed
                    </button>
                    <button
                      onClick={switchToFriends}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        shareDialog.shareMode === "friends"
                          ? "border-[#7C3AED] bg-[#7C3AED]/15 text-[#9D5CF6]"
                          : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Users className="w-4 h-4" /> Bạn bè
                    </button>
                  </div>

                  {/* Friends list */}
                  {shareDialog.shareMode === "friends" && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-xs text-gray-500">
                        Chọn bạn bè:
                      </span>
                      {shareDialog.loadingFriends ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang
                          tải...
                        </div>
                      ) : shareDialog.friends.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-2">
                          Chưa có bạn bè nào.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                          {shareDialog.friends.map((f) => {
                            const selected =
                              shareDialog.selectedFriends.includes(f._id);
                            return (
                              <button
                                key={f._id}
                                onClick={() =>
                                  setShareDialog((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      selectedFriends: selected
                                        ? prev.selectedFriends.filter(
                                            (fid) => fid !== f._id,
                                          )
                                        : [...prev.selectedFriends, f._id],
                                    };
                                  })
                                }
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm transition-all ${
                                  selected
                                    ? "border-[#7C3AED]/60 bg-[#7C3AED]/10 text-white"
                                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {f.avatar ? (
                                  <img
                                    src={f.avatar}
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-[#7C3AED]/40 flex-shrink-0" />
                                )}
                                <span className="flex-1 text-left truncate">
                                  {f.fullname || f.username}
                                </span>
                                {selected && (
                                  <Check className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-white/10 flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShareDialog(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={submitShare}
                  disabled={
                    shareDialog.saving ||
                    (shareDialog.shareMode === "friends" &&
                      shareDialog.selectedFriends.length === 0)
                  }
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    shareDialog.shareMode === "feed"
                      ? "bg-[#00E5FF] hover:bg-[#00BCCC] text-black"
                      : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  }`}
                >
                  {shareDialog.saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang chia
                      sẻ...
                    </>
                  ) : shareDialog.shareMode === "feed" ? (
                    <>
                      <Globe className="w-4 h-4" /> Đăng lên feed
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" /> Gửi cho bạn bè
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

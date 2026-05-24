"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Volume2,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Dumbbell,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Loader2,
  RotateCcw,
  Eye,
  Headphones,
  Video,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VocabItem {
  _id: string;
  word: string;
  phonetic?: string;
  translation: string;
  example?: string;
  note?: string;
  videoId?: string;
  videoTitle?: string;
  videoUrl?: string;
  segmentTime?: string;
  learned: boolean;
  createdAt: string;
}

interface VideoGroup {
  videoId: string;
  videoTitle: string;
  thumbnail: string | null;
  items: VocabItem[];
}

type Tab = "all" | "unlearned" | "learned";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function speak(word: string) {
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}

/** Extract first part of speech from "(noun) word1 | (verb) word2" */
function extractPos(translation: string): string {
  const match = translation?.match(/^\(([^)]+)\)/);
  return match ? match[1] : "";
}

/** Clean translation for display: "(noun) w1, w2 | (verb) w3" → "[noun] w1, w2  [verb] w3" */
function formatTranslation(translation: string): string {
  if (!translation) return "—";
  return translation
    .split(" | ")
    .map((part) => part.replace(/^\(([^)]+)\)\s*/, "[$1] "))
    .join("\n");
}

/** Parse "M:SS" or "H:MM:SS" → seconds */
function parseTime(t: string): number {
  if (!t) return 0;
  const parts = t.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

function groupByVideo(items: VocabItem[]): VideoGroup[] {
  const map = new Map<string, VideoGroup>();
  for (const item of items) {
    const key = item.videoId || "";
    if (!map.has(key)) {
      map.set(key, {
        videoId: key,
        videoTitle: item.videoTitle || (key ? "Video không có tiêu đề" : "Không xác định"),
        thumbnail: key ? `https://img.youtube.com/vi/${key}/mqdefault.jpg` : null,
        items: [],
      });
    }
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
}

// ─── Video Segment Dialog ─────────────────────────────────────────────────────────────────

function VideoSegmentDialog({
  videoId,
  startSec,
  endSec,
  transcript,
  onClose,
}: {
  videoId: string;
  startSec: number;
  endSec: number;
  transcript: string;
  onClose: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerId = useRef(`yt-vocab-${Date.now()}`).current;

  useEffect(() => {
    const initPlayer = () => {
      if (!document.getElementById(playerId)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerRef.current = new (window as any).YT.Player(playerId, {
        videoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onReady: (event: any) => {
            const player = event.target;
            playerRef.current = player;
            player.seekTo(startSec, true);
            player.playVideo();
            intervalRef.current = setInterval(() => {
              if (!playerRef.current?.getCurrentTime) return;
              const ct: number = playerRef.current.getCurrentTime();
              if (ct >= endSec) {
                playerRef.current.seekTo(startSec, true);
                playerRef.current.playVideo();
              }
            }, 300);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (e.data === (window as any).YT.PlayerState.ENDED) {
              playerRef.current.seekTo(startSec, true);
              playerRef.current.playVideo();
            }
          },
        },
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prevReady = (window as any).onYouTubeIframeAPIReady;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
        if (typeof prevReady === "function") prevReady();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
    };
  }, [videoId, startSec, endSec, playerId]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#1C1132] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Video gốc</span>
            {transcript && (
              <span className="text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                Ảm thanh lặp lại đoạn này
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video 16:9 */}
        <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
          <div id={playerId} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="px-5 py-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Nội dung đoạn</p>
            <p className="text-base text-white leading-relaxed">{transcript}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function EditModal({
  item,
  onSave,
  onClose,
}: {
  item: VocabItem;
  onSave: (updated: Partial<VocabItem>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    word: item.word,
    phonetic: item.phonetic ?? "",
    translation: item.translation,
    example: item.example ?? "",
    note: item.note ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1C1132] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-sm font-semibold text-white">Chỉnh sửa từ vựng</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {(
            [
              { label: "Từ vựng", key: "word" as const, placeholder: "Nhập từ..." },
              { label: "Phiên âm IPA", key: "phonetic" as const, placeholder: "/ˈwɜːrd/" },
              { label: "Nghĩa", key: "translation" as const, placeholder: "(noun) nghĩa 1 | (verb) nghĩa 2" },
              { label: "Ví dụ", key: "example" as const, placeholder: "Câu ví dụ..." },
              { label: "Ghi chú", key: "note" as const, placeholder: "Ghi chú thêm..." },
            ] as const
          ).map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{label}</label>
              {key === "translation" || key === "example" ? (
                <textarea
                  rows={2}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-[#2D1F47] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 outline-none focus:border-[#7C3AED] transition-colors resize-none"
                />
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-[#2D1F47] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 outline-none focus:border-[#7C3AED] transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...</> : <><Save className="w-3.5 h-3.5" /> Lưu</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Game Selector ────────────────────────────────────────────────────────────

function GameSelector({
  items,
  onSelect,
  onClose,
}: {
  items: VocabItem[];
  onSelect: (game: "matching" | "listen" | "fillblank") => void;
  onClose: () => void;
}) {
  const hasFillBlank = items.some(
    (v) => v.example && v.example.toLowerCase().includes(v.word.toLowerCase())
  );
  const games = [
    {
      id: "matching" as const,
      emoji: "🧩",
      title: "Nối từ",
      desc: "Nối từ vựng với nghĩa tương ứng",
      gradient: "from-violet-600/20 to-purple-700/20",
      border: "border-violet-500/30",
      available: items.length >= 2,
      unavailableHint: "",
    },
    {
      id: "listen" as const,
      emoji: "🎧",
      title: "Nghe điền từ",
      desc: "Nghe phát âm và gõ từ bạn nghe được",
      gradient: "from-cyan-600/20 to-blue-700/20",
      border: "border-cyan-500/30",
      available: true,
      unavailableHint: "",
    },
    {
      id: "fillblank" as const,
      emoji: "✏️",
      title: "Chọn từ đúng",
      desc: "Chọn từ đúng điền vào chỗ trống trong câu",
      gradient: "from-emerald-600/20 to-teal-700/20",
      border: "border-emerald-500/30",
      available: hasFillBlank && items.length >= 2,
      unavailableHint: "Cần từ có câu ví dụ",
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1C1132] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Chọn trò chơi</h2>
            <p className="text-xs text-gray-500 mt-0.5">{items.length} từ vựng sẽ được luyện tập</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => g.available && onSelect(g.id)}
              disabled={!g.available}
              className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r ${g.gradient} ${g.border} text-left w-full transition-all ${
                g.available
                  ? "hover:scale-[1.01] hover:border-white/30 cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="text-3xl flex-shrink-0">{g.emoji}</span>
              <div>
                <p className="text-white font-semibold text-sm">{g.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                {!g.available && g.unavailableHint && (
                  <p className="text-[10px] text-red-400 mt-0.5">{g.unavailableHint}</p>
                )}
              </div>
              {g.available && (
                <ChevronRight className="w-4 h-4 text-gray-500 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Matching Game ────────────────────────────────────────────────────────────

function MatchingGame({
  items,
  onClose,
  onLearned,
}: {
  items: VocabItem[];
  onClose: () => void;
  onLearned: (id: string, learned: boolean) => void;
}) {
  const BATCH = 6;
  const totalPages = Math.ceil(items.length / BATCH);
  const [pageIndex, setPageIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<VocabItem[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<VocabItem[]>([]);
  const [userPairs, setUserPairs] = useState<Map<string, string>>(new Map());
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // SVG line refs
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wordRefs = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meaningRefs = useRef<Map<string, any>>(new Map());
  const [svgLines, setSvgLines] = useState<Array<{
    id: string; x1: number; y1: number; x2: number; y2: number; correct?: boolean;
  }>>([]);

  const resetBatch = useCallback((batchItems: VocabItem[]) => {
    setShuffledWords([...batchItems].sort(() => Math.random() - 0.5));
    setShuffledMeanings([...batchItems].sort(() => Math.random() - 0.5));
    setUserPairs(new Map());
    setSelectedWordId(null);
    setChecked(false);
    setSvgLines([]);
    wordRefs.current.clear();
    meaningRefs.current.clear();
  }, []);

  useEffect(() => {
    const batch = items.slice(pageIndex * BATCH, (pageIndex + 1) * BATCH);
    resetBatch(batch);
  }, [pageIndex, items, resetBatch]);

  const batch = items.slice(pageIndex * BATCH, (pageIndex + 1) * BATCH);
  const allPaired = userPairs.size === batch.length;
  const correctCount = checked
    ? [...userPairs.entries()].filter(([wId, mId]) => wId === mId).length
    : 0;

  const shortMeaning = (item: VocabItem) =>
    item.translation
      .split(" | ")
      .map((p) => p.replace(/^\([^)]+\)\s*/, "").split(/[,;]/)[0].trim())
      .join(", ");

  // Recompute SVG line positions after DOM updates
  useLayoutEffect(() => {
    if (!containerRef.current || userPairs.size === 0) {
      setSvgLines([]);
      return;
    }
    const cr = containerRef.current.getBoundingClientRect();
    const newLines: typeof svgLines = [];
    for (const [wordId, meaningId] of userPairs.entries()) {
      const wEl = wordRefs.current.get(wordId);
      const mEl = meaningRefs.current.get(meaningId);
      if (!wEl || !mEl) continue;
      const wRect = wEl.getBoundingClientRect();
      const mRect = mEl.getBoundingClientRect();
      newLines.push({
        id: `${wordId}-${meaningId}`,
        x1: wRect.right - cr.left,
        y1: wRect.top - cr.top + wRect.height / 2,
        x2: mRect.left - cr.left,
        y2: mRect.top - cr.top + mRect.height / 2,
        correct: checked ? wordId === meaningId : undefined,
      });
    }
    setSvgLines(newLines);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPairs, checked]);

  const handleWordClick = (wordId: string) => {
    if (checked) return;
    setSelectedWordId((prev) => (prev === wordId ? null : wordId));
  };

  const handleMeaningClick = (meaningId: string) => {
    if (checked || !selectedWordId) return;
    const newPairs = new Map(userPairs);
    for (const [wId, mId] of newPairs.entries()) {
      if (mId === meaningId) newPairs.delete(wId);
    }
    newPairs.set(selectedWordId, meaningId);
    setUserPairs(newPairs);
    setSelectedWordId(null);
  };

  const handleCheck = () => {
    setChecked(true);
    for (const [wordId, meaningId] of userPairs.entries()) {
      onLearned(wordId, wordId === meaningId);
    }
  };

  if (!shuffledWords.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-lg">🧩 Nối từ</span>
            <p className="text-xs text-gray-400 mt-0.5">
              Trang {pageIndex + 1}/{totalPages} · {userPairs.size}/{batch.length} cặp đã nối
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className="bg-[#7C3AED] h-1 rounded-full transition-all duration-300"
            style={{ width: `${(userPairs.size / batch.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-[#1C1132] border border-white/15 rounded-2xl p-6 flex flex-col gap-4">
          {checked ? (
            /* ── Score header ── */
            <div className="flex items-center justify-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                correctCount === batch.length ? "bg-emerald-500/20" : "bg-[#7C3AED]/20"
              }`}>
                <span className="text-2xl font-bold text-white">{correctCount}</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">/{batch.length} đúng</p>
                <p className="text-xs text-gray-500">
                  {correctCount === batch.length
                    ? "Xuất sắc! Tất cả đều đúng 🎉"
                    : `${batch.length - correctCount} cặp chưa đúng`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center">
              Nhấp vào một từ, rồi nhấp vào nghĩa tương ứng
            </p>
          )}

          {/* ── Two-column grid with SVG overlay ── */}
          <div ref={containerRef} className="relative">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {/* Words column */}
              <div className="flex flex-col gap-2">
                {shuffledWords.map((item) => {
                  const isPaired = userPairs.has(item._id);
                  const isCorrect = checked && userPairs.get(item._id) === item._id;
                  const isWrong = checked && isPaired && !isCorrect;
                  return checked ? (
                    <div
                      key={item._id}
                      ref={(el) => { if (el) wordRefs.current.set(item._id, el); }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${
                        isCorrect
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : isWrong
                          ? "bg-red-500/15 text-red-300 border-red-500/30"
                          : "bg-[#2D1F47] text-gray-500 border-white/5"
                      }`}
                    >
                      {item.word}
                    </div>
                  ) : (
                    <button
                      key={item._id}
                      ref={(el) => { if (el) wordRefs.current.set(item._id, el); }}
                      onClick={() => handleWordClick(item._id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                        selectedWordId === item._id
                          ? "bg-[#7C3AED]/30 text-white border border-[#7C3AED]"
                          : isPaired
                          ? "bg-[#00E5FF]/10 text-white border border-[#00E5FF]/40"
                          : "bg-[#2D1F47] text-white border border-white/10 hover:border-white/30 hover:bg-[#3E2465]"
                      }`}
                    >
                      {item.word}
                    </button>
                  );
                })}
              </div>

              {/* Meanings column */}
              <div className="flex flex-col gap-2">
                {shuffledMeanings.map((item) => {
                  const isUsed = [...userPairs.values()].includes(item._id);
                  const pairedWordId = checked
                    ? [...userPairs.entries()].find(([, mId]) => mId === item._id)?.[0]
                    : undefined;
                  const isCorrect = checked && pairedWordId === item._id;
                  const isWrong = checked && isUsed && !isCorrect;
                  return checked ? (
                    <div
                      key={item._id}
                      ref={(el) => { if (el) meaningRefs.current.set(item._id, el); }}
                      className={`px-4 py-2.5 rounded-xl text-sm border ${
                        isCorrect
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : isWrong
                          ? "bg-red-500/15 text-red-300 border-red-500/30"
                          : "bg-[#2D1F47] text-gray-500 border-white/5"
                      }`}
                    >
                      {shortMeaning(item)}
                    </div>
                  ) : (
                    <button
                      key={item._id}
                      ref={(el) => { if (el) meaningRefs.current.set(item._id, el); }}
                      onClick={() => handleMeaningClick(item._id)}
                      className={`px-4 py-2.5 rounded-xl text-sm text-left transition-all ${
                        isUsed
                          ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30"
                          : selectedWordId
                          ? "bg-[#2D1F47] text-gray-200 border border-white/10 hover:border-[#7C3AED]/60 hover:bg-[#3E2465]"
                          : "bg-[#2D1F47] text-gray-200 border border-white/10"
                      }`}
                    >
                      {shortMeaning(item)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SVG connection lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: "visible" }}
            >
              {svgLines.map((line) => {
                const mid = (line.x1 + line.x2) / 2;
                const color =
                  line.correct === true
                    ? "#10b981"
                    : line.correct === false
                    ? "#ef4444"
                    : "#00E5FF";
                return (
                  <path
                    key={line.id}
                    d={`M ${line.x1} ${line.y1} C ${mid} ${line.y1}, ${mid} ${line.y2}, ${line.x2} ${line.y2}`}
                    stroke={color}
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </div>

          {/* Wrong pair corrections (shown after check) */}
          {checked && [...userPairs.entries()].some(([wId, mId]) => wId !== mId) && (
            <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Đáp án đúng</p>
              {shuffledWords
                .filter((w) => userPairs.get(w._id) !== w._id)
                .map((w) => (
                  <p key={w._id} className="text-xs text-gray-300">
                    <span className="text-red-400 font-semibold">{w.word}</span>
                    <span className="text-gray-500"> → </span>
                    <span className="text-emerald-400">{shortMeaning(w)}</span>
                  </p>
                ))}
            </div>
          )}

          {/* Action buttons */}
          {checked ? (
            <div className="flex gap-3">
              <button
                onClick={() => resetBatch(batch)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại
              </button>
              {pageIndex + 1 < totalPages ? (
                <button
                  onClick={() => setPageIndex((p) => p + 1)}
                  className="flex-1 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors"
                >
                  Trang tiếp →
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors"
                >
                  Đóng
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleCheck}
              disabled={!allPaired}
              className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {allPaired ? "Kiểm tra kết quả" : `Còn ${batch.length - userPairs.size} cặp chưa nối`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Listen Type Game ─────────────────────────────────────────────────────────

function ListenTypeGame({
  items,
  onClose,
  onLearned,
}: {
  items: VocabItem[];
  onClose: () => void;
  onLearned: (id: string, learned: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = items[index];

  useEffect(() => {
    if (current) setTimeout(() => speak(current.word), 400);
  }, [index, current]);

  useEffect(() => {
    if (status === "idle") inputRef.current?.focus();
  }, [status, index]);

  const check = () => {
    if (!input.trim()) return;
    const correct = input.trim().toLowerCase() === current.word.toLowerCase();
    if (correct) {
      setStatus("correct");
      onLearned(current._id, true);
      setScore((s) => s + 1);
    } else {
      setStatus("wrong");
      onLearned(current._id, false);
    }
  };

  const nextWord = () => {
    setInput("");
    setStatus("idle");
    if (index + 1 >= items.length) setDone(true);
    else setIndex((i) => i + 1);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#1C1132] border border-white/15 rounded-2xl p-8 flex flex-col items-center gap-6">
          <span className="text-5xl">🎧</span>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">Hoàn thành!</h3>
            <p className="text-gray-400 text-sm mt-1">Đúng {score}/{items.length} từ</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setIndex(0); setInput(""); setStatus("idle"); setDone(false); setScore(0); }}
              className="flex-1 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại
            </button>
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#7C3AED] text-white font-semibold text-sm">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{index + 1} / {items.length}</span>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className="bg-[#00E5FF] h-1 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>

        <div className="bg-[#1C1132] border border-white/15 rounded-2xl p-8 flex flex-col items-center gap-5">
          <button
            onClick={() => speak(current.word)}
            className="w-24 h-24 rounded-full bg-[#00E5FF]/10 border-2 border-[#00E5FF]/40 flex items-center justify-center hover:bg-[#00E5FF]/20 transition-all hover:scale-105 active:scale-95"
          >
            <Headphones className="w-10 h-10 text-[#00E5FF]" />
          </button>
          <p className="text-xs text-gray-500">Nhấn để nghe lại</p>

          {current.phonetic && status !== "idle" && (
            <p className="text-[#00E5FF] text-sm">{current.phonetic}</p>
          )}

          <div className="w-full flex flex-col gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") status === "idle" ? check() : nextWord();
              }}
              placeholder="Gõ từ bạn nghe được..."
              disabled={status !== "idle"}
              className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 border outline-none transition-colors text-center text-lg font-medium ${
                status === "correct"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                  : status === "wrong"
                  ? "bg-red-500/10 border-red-500/50 text-red-400"
                  : "bg-[#2D1F47] border-white/10 focus:border-[#00E5FF]"
              }`}
            />
            {status === "correct" && (
              <p className="text-emerald-400 text-sm text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Chính xác! ✨
              </p>
            )}
            {status === "wrong" && (
              <p className="text-red-400 text-sm text-center">
                Đáp án đúng: <span className="font-bold text-white">{current.word}</span>
              </p>
            )}
          </div>

          {status === "idle" ? (
            <button
              onClick={check}
              disabled={!input.trim()}
              className="w-full py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00cfeb] text-black font-semibold text-sm transition-colors disabled:opacity-40"
            >
              Kiểm tra
            </button>
          ) : (
            <button
              onClick={nextWord}
              className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors"
            >
              {index + 1 >= items.length ? "Xem kết quả" : "Từ tiếp theo →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fill Blank Game ──────────────────────────────────────────────────────────

function FillBlankGame({
  items,
  allItems,
  onClose,
  onLearned,
}: {
  items: VocabItem[];
  allItems: VocabItem[];
  onClose: () => void;
  onLearned: (id: string, learned: boolean) => void;
}) {
  const validItems = items.filter(
    (v) => v.example && v.example.toLowerCase().includes(v.word.toLowerCase())
  );

  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const current = validItems[index];

  useEffect(() => {
    const item = validItems[index];
    if (!item) return;
    const others = allItems.filter((v) => v.word.toLowerCase() !== item.word.toLowerCase());
    const wrong = [...others].sort(() => Math.random() - 0.5).slice(0, 3).map((v) => v.word);
    setChoices([...wrong, item.word].sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]); // only re-run when question index changes, not on every render

  const blankSentence = (example: string, word: string) =>
    example.replace(new RegExp(word, "gi"), "______");

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer.toLowerCase() === current.word.toLowerCase()) {
      onLearned(current._id, true);
      setScore((s) => s + 1);
    } else {
      onLearned(current._id, false);
    }
  };

  const next = () => {
    setSelectedAnswer(null);
    if (index + 1 >= validItems.length) setDone(true);
    else setIndex((i) => i + 1);
  };

  if (!validItems.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#1C1132] border border-white/15 rounded-2xl p-8 text-center flex flex-col gap-4">
          <p className="text-white">Không có từ nào có câu ví dụ phù hợp</p>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm">Đóng</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#1C1132] border border-white/15 rounded-2xl p-8 flex flex-col items-center gap-6">
          <span className="text-5xl">✏️</span>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">Hoàn thành!</h3>
            <p className="text-gray-400 text-sm mt-1">Đúng {score}/{validItems.length} câu</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setIndex(0); setSelectedAnswer(null); setDone(false); setScore(0); }}
              className="flex-1 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại
            </button>
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#7C3AED] text-white font-semibold text-sm">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{index + 1} / {validItems.length}</span>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className="bg-emerald-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / validItems.length) * 100}%` }}
          />
        </div>

        <div className="bg-[#1C1132] border border-white/15 rounded-2xl p-6 flex flex-col gap-5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 text-center">Điền vào chỗ trống</p>

          {/* Sentence */}
          <p className="text-white text-lg leading-relaxed text-center min-h-[3rem]">
            {blankSentence(current.example!, current.word)}
          </p>

          {/* Translation hint */}
          <p className="text-xs text-gray-500 text-center italic">
            {formatTranslation(current.translation)}
          </p>

          {/* 4 choices */}
          <div className="grid grid-cols-2 gap-2">
            {choices.map((choice) => {
              const isCorrect = choice.toLowerCase() === current.word.toLowerCase();
              const isSelected = selectedAnswer === choice;
              return (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  disabled={!!selectedAnswer}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    selectedAnswer
                      ? isCorrect
                        ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                        : isSelected
                        ? "bg-red-500/20 border border-red-500/50 text-red-400"
                        : "bg-[#2D1F47] border border-white/5 text-gray-500 opacity-50"
                      : "bg-[#2D1F47] border border-white/15 text-white hover:border-white/30 hover:bg-[#3E2465]"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Feedback + Next button */}
          {selectedAnswer && (
            <div className="flex flex-col gap-3">
              <p className={`text-center text-sm font-medium ${
                selectedAnswer.toLowerCase() === current.word.toLowerCase()
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}>
                {selectedAnswer.toLowerCase() === current.word.toLowerCase()
                  ? "✓ Chính xác! 🎉"
                  : `✗ Đáp án đúng: "${current.word}"`}
              </p>
              <button
                onClick={next}
                className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors"
              >
                {index + 1 >= validItems.length ? "Xem kết quả →" : "Tiếp theo →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Practice Mode ────────────────────────────────────────────────────────────

function PracticeMode({
  items,
  onClose,
  onLearned,
}: {
  items: VocabItem[];
  onClose: () => void;
  onLearned: (id: string, learned: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const current = items[index];

  const next = () => {
    setFlipped(false);
    setTimeout(() => {
      if (index + 1 >= items.length) setDone(true);
      else setIndex((i) => i + 1);
    }, 200);
  };

  const prev = () => {
    if (index === 0) return;
    setFlipped(false);
    setTimeout(() => setIndex((i) => i - 1), 200);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#1C1132] border border-white/15 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-1">Hoàn thành!</h3>
            <p className="text-sm text-gray-400">Bạn đã luyện tập xong {items.length} từ vựng</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setIndex(0); setFlipped(false); setDone(false); }}
              className="flex-1 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Luyện lại
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{index + 1} / {items.length}</span>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className="bg-[#7C3AED] h-1 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>

        {/* Flip card */}
        <div className="relative" style={{ perspective: "1200px" }}>
          <div
            className="relative w-full transition-transform duration-500 cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            onClick={() => setFlipped((f) => !f)}
          >
            {/* Front */}
            <div
              className="w-full bg-[#2D1F47] border border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[260px] gap-3"
              style={{ backfaceVisibility: "hidden" }}
            >
              <h2 className="text-4xl font-bold text-white">{current.word}</h2>
              {current.phonetic && <p className="text-base text-[#00E5FF]">{current.phonetic}</p>}
              {extractPos(current.translation) && (
                <span className="text-xs italic text-[#7C3AED] bg-[#7C3AED]/15 px-3 py-1 rounded-full">
                  {extractPos(current.translation)}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); speak(current.word); }}
                className="mt-2 p-3 rounded-xl bg-[#1C1132] border border-white/10 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Nhấp để xem nghĩa</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-[#1C1132] border border-[#7C3AED]/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[260px]"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Nghĩa</p>
              <p className="text-lg text-white font-medium text-center leading-relaxed whitespace-pre-line">
                {formatTranslation(current.translation)}
              </p>
              {current.example && (
                <p className="text-sm text-[#00E5FF] italic text-center">"{current.example}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={index === 0}
            className="p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { onLearned(current._id, false); next(); }}
            className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-sm font-medium transition-colors"
          >
            Chưa thuộc
          </button>
          <button
            onClick={() => { onLearned(current._id, true); next(); }}
            className="flex-1 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-sm font-medium transition-colors"
          >
            Đã thuộc ✓
          </button>
          <button
            onClick={next}
            className="p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vocab Card ────────────────────────────────────────────────────────────────

function VocabCard({
  item,
  onLearned,
  onEdit,
  onDelete,
  onVideoPlay,
}: {
  item: VocabItem;
  onLearned: (id: string, learned: boolean) => void;
  onEdit: (item: VocabItem) => void;
  onDelete: (id: string) => void;
  onVideoPlay: (item: VocabItem) => void;
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
        onClick={() => onLearned(item._id, !item.learned)}
        title={item.learned ? "Bỏ đánh dấu đã thuộc" : "Đánh dấu là đã nhớ"}
        className={`p-2 rounded-xl transition-colors ${
          item.learned
            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        {item.learned ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => { onEdit(item); setFlipped(false); }}
        className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-[#7C3AED]/20 hover:text-[#7C3AED] transition-colors"
        title="Chỉnh sửa"
      >
        <Pencil className="w-3.5 h-3.5" />
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
      {/* CSS Grid stacking: both faces occupy the same cell → taller one drives height */}
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
        {/* ── FRONT ── */}
        <div
          className="bg-[#2D1F47] border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-2 transition-colors min-h-[220px]"
          style={{ gridArea: "card", backfaceVisibility: "hidden" }}
        >
          {/* Learned badge */}
          {/* Word row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white leading-tight">{item.word}</h3>
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
              onClick={(e) => { e.stopPropagation(); speak(item.word); }}
              className="p-2.5 rounded-xl bg-[#1C1132] border border-white/10 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors flex-shrink-0"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Spacer pushes hint + actions to bottom */}
          <div className="flex-1" />

          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-gray-600">Nhấp để xem nghĩa →</p>
            {item.videoId && (
              <button
                onClick={(e) => { e.stopPropagation(); onVideoPlay(item); }}
                className="text-xs text-[#7C3AED] hover:text-[#a78bfa] flex items-center gap-1 transition-colors flex-shrink-0"
              >
                🎬 {item.segmentTime ?? "Video gốc"}
              </button>
            )}
          </div>

          {/* Learned badge — bottom so it doesn't crowd the word */}
          {item.learned && (
            <span className="self-start text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              ✓ Đã thuộc
            </span>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <CardActions />
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="bg-[#1C1132] border border-[#7C3AED]/40 rounded-2xl p-5 flex flex-col gap-3 min-h-[220px]"
          style={{ gridArea: "card", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Nghĩa</p>
            <p className="text-sm text-white leading-relaxed whitespace-pre-line">
              {formatTranslation(item.translation)}
            </p>
          </div>
          {item.example && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Ví dụ</p>
              <p className="text-sm text-[#00E5FF] italic leading-relaxed">"{item.example}"</p>
            </div>
          )}
          {item.note && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Ghi chú</p>
              <p className="text-xs text-gray-300 leading-relaxed">{item.note}</p>
            </div>
          )}

          {/* Spacer pushes actions to bottom */}
          <div className="flex-1" />

          <div onClick={(e) => e.stopPropagation()}>
            <CardActions />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Video Vocab Modal ─────────────────────────────────────────────────────────────────

function VideoVocabModal({
  group,
  onClose,
  onPracticeVocab,
  onLearned,
  onEdit,
  onDelete,
  onVideoPlay,
}: {
  group: VideoGroup;
  onClose: () => void;
  onPracticeVocab: () => void;
  onLearned: (id: string, learned: boolean) => void;
  onEdit: (item: VocabItem) => void;
  onDelete: (id: string) => void;
  onVideoPlay: (item: VocabItem) => void;
}) {
  const learnedCount = group.items.filter((v) => v.learned).length;

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-5xl max-h-[90vh] bg-[#1C1132] border border-white/15 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 flex-shrink-0">
          {group.thumbnail && (
            <img src={group.thumbnail} alt={group.videoTitle} className="w-20 h-[45px] rounded-lg object-cover bg-black flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm leading-snug line-clamp-1">{group.videoTitle}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{group.items.length} từ · {learnedCount} đã thuộc</p>
          </div>
          <button
            onClick={onPracticeVocab}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            <Dumbbell className="w-3.5 h-3.5" /> Luyện từ vựng
          </button>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.items.map((item) => (
              <VocabCard
                key={item._id}
                item={item}
                onLearned={onLearned}
                onEdit={onEdit}
                onDelete={onDelete}
                onVideoPlay={onVideoPlay}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Video Section ────────────────────────────────────────────────────────────

function VideoSection({
  group,
  onOpenCards,
  onPracticeVocab,
  onPracticeListening,
}: {
  group: VideoGroup;
  onOpenCards: () => void;
  onPracticeVocab: () => void;
  onPracticeListening: () => void;
}) {
  const learnedCount = group.items.filter((v) => v.learned).length;

  return (
    <div className="flex items-center gap-4 p-4 bg-[#1C1132]/70 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
      {/* Thumbnail */}
      {group.thumbnail ? (
        <img
          src={group.thumbnail}
          alt={group.videoTitle}
          className="w-28 h-[63px] rounded-xl object-cover flex-shrink-0 bg-black"
        />
      ) : (
        <div className="w-28 h-[63px] rounded-xl bg-[#2D1F47] flex-shrink-0 flex items-center justify-center border border-white/10">
          <Video className="w-6 h-6 text-gray-500" />
        </div>
      )}

      {/* Title + stats */}
      <div className="flex-1 min-w-0">
        <button
          onClick={onOpenCards}
          className="text-left group w-full"
        >
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#00E5FF] transition-colors underline-offset-2 group-hover:underline">
            {group.videoTitle}
          </h3>
        </button>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-xs text-gray-500">
            {group.items.length} từ · {learnedCount} đã thuộc
          </span>
          <button
            onClick={onPracticeVocab}
            className="text-xs text-[#7C3AED] hover:text-[#a78bfa] flex items-center gap-1 transition-colors"
          >
            <Dumbbell className="w-3 h-3" /> Luyện từ vựng
          </button>
        </div>
      </div>

      {/* Practice listening button */}
      {group.videoId && (
        <button
          onClick={onPracticeListening}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/20 text-sm font-medium transition-colors flex-shrink-0"
        >
          <Headphones className="w-4 h-4" />
          Luyện tập lại
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "unlearned", label: "Chưa thuộc" },
  { id: "learned", label: "Đã thuộc" },
];

export default function VocabularyPage() {
  const router = useRouter();
  const [items, setItems] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [editItem, setEditItem] = useState<VocabItem | null>(null);
  const [practiceItems, setPracticeItems] = useState<VocabItem[] | null>(null);
  const [gameType, setGameType] = useState<"matching" | "listen" | "fillblank" | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<VideoGroup | null>(null);
  const [videoDialog, setVideoDialog] = useState<{
    videoId: string; startSec: number; endSec: number; transcript: string;
  } | null>(null);

  const openVideoDialog = useCallback((item: VocabItem) => {
    if (!item.videoId) return;
    const startSec = parseTime(item.segmentTime ?? "0");
    const words = (item.example ?? "").trim().split(/\s+/).filter(Boolean).length;
    const endSec = startSec + Math.max(4, Math.ceil(words / 2.2) + 1);
    setVideoDialog({ videoId: item.videoId, startSec, endSec, transcript: item.example ?? "" });
  }, []);

  const fetchVocab = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/vocabulary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.vocabulary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVocab(); }, [fetchVocab]);

  const toggleExpand = useCallback((videoId: string) => {
    setExpandedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  }, []);

  const toggleLearned = useCallback(async (id: string, learned: boolean) => {
    setItems((prev) => prev.map((v) => (v._id === id ? { ...v, learned } : v)));
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/vocabulary/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ learned }),
      });
    } catch {
      setItems((prev) => prev.map((v) => (v._id === id ? { ...v, learned: !learned } : v)));
    }
  }, []);

  const saveEdit = useCallback(async (updated: Partial<VocabItem>) => {
    if (!editItem) return;
    const id = editItem._id;
    setItems((prev) => prev.map((v) => (v._id === id ? { ...v, ...updated } : v)));
    setEditItem(null);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/vocabulary/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
    } catch {
      fetchVocab();
    }
  }, [editItem, fetchVocab]);

  const deleteItem = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((v) => v._id !== id));
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/vocabulary/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchVocab();
    }
  }, [fetchVocab]);

  const filtered = items.filter((v) => {
    if (tab === "learned") return v.learned;
    if (tab === "unlearned") return !v.learned;
    return true;
  });

  const videoGroups = groupByVideo(filtered);

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[#00E5FF]" />
          Từ vựng của tôi
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {items.length} từ · {items.filter((v) => v.learned).length} đã thuộc · {new Set(items.map((v) => v.videoId).filter(Boolean)).size} video
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-[#1C1132]/60 rounded-2xl p-1 mb-8 w-fit">
        {TABS.map(({ id, label }) => {
          const count =
            id === "all" ? items.length
            : id === "learned" ? items.filter((v) => v.learned).length
            : items.filter((v) => !v.learned).length;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? "bg-[#7C3AED] text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? "bg-white/20" : "bg-white/10"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-60 gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin text-[#00E5FF]" />
          <p className="text-sm">Đang tải từ vựng...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#2D1F47] flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-gray-500" />
          </div>
          <div>
            <p className="text-white font-medium">
              {tab === "learned" ? "Chưa có từ nào được đánh dấu đã thuộc"
               : tab === "unlearned" ? "Tất cả từ đã được đánh dấu thuộc rồi!"
               : "Chưa có từ vựng nào"}
            </p>
            {tab === "all" && (
              <p className="text-sm text-gray-400 mt-1">Hãy luyện tập và lưu từ vựng trong video</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {videoGroups.map((group) => (
            <VideoSection
              key={group.videoId}
              group={group}
              onOpenCards={() => setSelectedGroup(group)}
              onPracticeVocab={() => {
                setPracticeItems([...group.items].sort(() => Math.random() - 0.5));
                setGameType(null);
              }}
              onPracticeListening={() =>
                router.push(
                  `/dashboard/practice/${group.videoId}?title=${encodeURIComponent(group.videoTitle)}`
                )
              }
            />
          ))}
        </div>
      )}

      {/* ── Video Vocab Modal ── */}
      {selectedGroup && typeof document !== "undefined" && (
        <VideoVocabModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onPracticeVocab={() => {
            setPracticeItems([...selectedGroup.items].sort(() => Math.random() - 0.5));
            setGameType(null);
            setSelectedGroup(null);
          }}
          onLearned={toggleLearned}
          onEdit={setEditItem}
          onDelete={deleteItem}
          onVideoPlay={openVideoDialog}
        />
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <EditModal
          item={editItem}
          onSave={saveEdit}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* ── Practice Games ── */}
      {practiceItems && !gameType && typeof document !== "undefined" && (
        <GameSelector
          items={practiceItems}
          onSelect={setGameType}
          onClose={() => { setPracticeItems(null); setGameType(null); }}
        />
      )}
      {practiceItems && gameType === "matching" && (
        <MatchingGame
          items={practiceItems}
          onClose={() => setGameType(null)}
          onLearned={toggleLearned}
        />
      )}
      {practiceItems && gameType === "listen" && (
        <ListenTypeGame
          items={practiceItems}
          onClose={() => setGameType(null)}
          onLearned={toggleLearned}
        />
      )}
      {practiceItems && gameType === "fillblank" && (
        <FillBlankGame
          items={practiceItems}
          allItems={items}
          onClose={() => setGameType(null)}
          onLearned={toggleLearned}
        />
      )}

      {/* ── Video Segment Dialog ── */}
      {videoDialog && typeof document !== "undefined" && (
        <VideoSegmentDialog
          videoId={videoDialog.videoId}
          startSec={videoDialog.startSec}
          endSec={videoDialog.endSec}
          transcript={videoDialog.transcript}
          onClose={() => setVideoDialog(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  MessageSquare,
  RotateCcw,
  Lightbulb,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  Headphones,
  Volume2,
  X,
  BookmarkPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TranscriptItem {
  time: string;
  text: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/** Parse "M:SS" or "H:MM:SS" → seconds */
function parseTime(t: string): number {
  const parts = t.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

/** Lowercase + strip punctuation for word comparison */
const normalizeWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

// ─── Dictionary types ───────────────────────────────────────────────────────
interface DictPhonetic { text?: string; audio?: string; }
interface DictMeaning { partOfSpeech: string; definitions: { definition: string }[]; }
interface DictEntry { word: string; phonetics: DictPhonetic[]; meanings: DictMeaning[]; }

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LeftPanelProps {
  videoId: string;
  transcript: TranscriptItem[];
  loading: boolean;
  error: string | null;
  activeIndex: number;
  onSeek: (seconds: number) => void;
  onReview: (idx: number) => void;
  completedSegments: Set<number>;
}

function LeftPanel({ transcript, loading, error, activeIndex, onSeek, onReview, completedSegments }: LeftPanelProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active item to center of the transcript container (not the page)
  useEffect(() => {
    if (activeIndex < 0) return;
    const container = scrollContainerRef.current;
    const item = itemRefs.current[activeIndex];
    if (!container || !item) return;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;

    // Only scroll if item is outside visible area
    if (itemTop < containerTop || itemBottom > containerBottom) {
      container.scrollTo({
        top: itemTop - container.clientHeight / 2 + item.offsetHeight / 2,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const toggleCheck = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const checkedCount = transcript.filter((_, i) => !!checked[i] || completedSegments.has(i)).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#00E5FF]" />
        <span className="text-sm font-medium text-white">Transcript</span>
        {!loading && transcript.length > 0 && (
          <span className="ml-auto text-xs text-gray-500">{transcript.length} đoạn</span>
        )}
      </div>

      {/* Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
            <p className="text-xs">Đang tải transcript...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-xs text-red-400">{error}</p>
            <p className="text-xs text-gray-500">Video này có thể không có phụ đề tự động</p>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Đánh dấu đoạn đã học
              </p>
              <span className="text-xs text-[#00E5FF] font-medium">
                {checkedCount}/{transcript.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 mb-4">
              <div
                className="bg-[#00E5FF] h-1 rounded-full transition-all duration-300"
                style={{ width: `${transcript.length ? (checkedCount / transcript.length) * 100 : 0}%` }}
              />
            </div>

            {transcript.map((line, i) => {
              const isActive = i === activeIndex;
              const isComplete = completedSegments.has(i);
              const isChecked = !!checked[i] || isComplete;
              return (
                <div
                  key={i}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  onClick={() => isComplete ? onReview(i) : onSeek(parseTime(line.time))}
                  className={`flex gap-3 rounded-xl p-3 cursor-pointer transition-all select-none border ${
                    isActive
                      ? "bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                      : isChecked
                      ? "bg-[#00E5FF]/10 border-[#00E5FF]/30"
                      : "bg-[#2D1F47]/40 border-transparent hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    onClick={(e) => toggleCheck(i, e)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      isChecked ? "border-[#00E5FF] bg-[#00E5FF]" : "border-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Number + content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${
                        isActive ? "text-[#00E5FF]" : "text-gray-500"
                      }`}>
                        #{i + 1}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#00E5FF] text-black"
                            : isChecked
                            ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {line.time}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-[#00E5FF] font-bold animate-pulse">▶</span>
                      )}
                    </div>
                    <p
                      className={`text-sm leading-relaxed transition-colors ${
                        isActive
                          ? "text-white font-medium"
                          : isChecked
                          ? "text-gray-400 line-through"
                          : "text-gray-200"
                      }`}
                    >
                      {isComplete ? line.text : line.text.replace(/\S/g, "*")}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

interface DictationPanelProps {
  videoId: string;
  videoTitle: string;
  studyIndex: number;
  transcript: TranscriptItem[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplay: () => void;
  onSkip: () => void;
  onSegmentComplete: (idx: number) => void;
  completedSegments: Set<number>;
}

function DictationPanel({ videoId, videoTitle, studyIndex, transcript, isPlaying, onPlayPause, onReplay, onSkip, onSegmentComplete, completedSegments }: DictationPanelProps) {
  const [input, setInput] = useState("");
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const revealedRef = useRef<Set<number>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [wordDetail, setWordDetail] = useState<{
    word: string;
    phonetic: string | null;
    dictMeanings: { partOfSpeech: string; translations: string[] }[];
    translation: string | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const [vocabDialog, setVocabDialog] = useState<{
    word: string; phonetic: string; translation: string; example: string; note: string;
    videoId: string; videoTitle: string; videoUrl: string; segmentTime: string;
    saving: boolean; saved: boolean;
  } | null>(null);

  const openVocabDialog = () => {
    if (!wordDetail) return;
    const trans = wordDetail.dictMeanings.length > 0
      ? wordDetail.dictMeanings.map((m) => `(${m.partOfSpeech}) ${m.translations.join(", ")}`).join(" | ")
      : wordDetail.translation ?? "";
    const seg = studyIndex >= 0 ? transcript[studyIndex] : null;
    setVocabDialog({
      word: wordDetail.word,
      phonetic: wordDetail.phonetic ?? "",
      translation: trans,
      example: seg?.text ?? "",
      note: "",
      videoId,
      videoTitle,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}${seg ? `&t=${Math.floor(parseTime(seg.time))}` : ""}`,
      segmentTime: seg?.time ?? "",
      saving: false,
      saved: false,
    });
  };

  const saveVocab = async () => {
    if (!vocabDialog) return;
    setVocabDialog((v) => v && { ...v, saving: true });
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          word: vocabDialog.word,
          phonetic: vocabDialog.phonetic,
          translation: vocabDialog.translation,
          example: vocabDialog.example,
          note: vocabDialog.note,
          videoId: vocabDialog.videoId,
          videoTitle: vocabDialog.videoTitle,
          videoUrl: vocabDialog.videoUrl,
          segmentTime: vocabDialog.segmentTime,
        }),
      });
      setVocabDialog((v) => v && { ...v, saving: false, saved: true });
      setTimeout(() => setVocabDialog(null), 800);
    } catch {
      setVocabDialog((v) => v && { ...v, saving: false });
    }
  };

  const handleWordClick = (word: string) => {
    const normalized = word.toLowerCase().replace(/[^a-z'-]/g, "");
    if (!normalized) return;
        setWordDetail({ word: normalized, phonetic: null, dictMeanings: [], translation: null, loading: true, error: null });
    fetch(`http://localhost:5000/api/dictionary/lookup?word=${encodeURIComponent(normalized)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setWordDetail({ word: normalized, phonetic: null, dictMeanings: [], translation: null, loading: false, error: "Lỗi kết nối server" });
          return;
        }
        setWordDetail({
          word: normalized,
          phonetic: data.phonetic ?? null,
          dictMeanings: (data.dictMeanings as { partOfSpeech: string; translations: string[] }[]) ?? [],
          translation: data.translation ?? null,
          loading: false,
          error: null,
        });
      })
      .catch(() => {
        setWordDetail({ word: normalized, phonetic: null, dictMeanings: [], translation: null, loading: false, error: "Lỗi kết nối server" });
      });
  };

  const currentSegment = studyIndex >= 0 ? transcript[studyIndex] : null;
  // Strip leading/trailing punctuation from each word so ".hello," → "hello"
  const words = (currentSegment?.text.trim().split(/\s+/) ?? []).map((w) =>
    w.replace(/^[.,!?;:'"()\[\]—…\-]+|[.,!?;:'"()\[\]—…\-]+$/g, "")
  ).filter(Boolean);

  // Reset state when study segment changes
  useEffect(() => {
    setInput("");
    revealedRef.current = new Set();
    setRevealedWords(new Set());
    setTranslation(null);
    setTranslationLoading(false);
    setIsCompleted(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [studyIndex]);

  // Enter review/completion mode when this segment is in completedSegments
  useEffect(() => {
    if (!completedSegments.has(studyIndex) || studyIndex < 0) return;
    const seg = transcript[studyIndex];
    if (!seg) return;
    const ws = (seg.text.trim().split(/\s+/) ?? []).map((w) =>
      w.replace(/^[.,!?;:'"()\[\]—…\-]+|[.,!?;:'"()\[\]—…\-]+$/g, "")
    ).filter(Boolean);
    const all = new Set<number>(ws.map((_, i) => i));
    revealedRef.current = all;
    setRevealedWords(all);
    setIsCompleted(true);
    // Fetch translation
    setTranslationLoading(true);
    setTranslation(null);
    fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(seg.text)}`
    )
      .then((r) => r.json())
      .then((data) => {
        const translated = (data[0] as Array<[string]>).map((item) => item[0]).join("");
        setTranslation(translated);
      })
      .catch(() => setTranslation("(Không thể dịch)"))
      .finally(() => setTranslationLoading(false));
  }, [studyIndex, completedSegments, transcript]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!words.length || isCompleted) return;
    const tokens = value.split(/\s+/).map(normalizeWord).filter(Boolean);

    // Greedy subsequence match: scan input tokens left→right,
    // each token reveals the next matching word in transcript order.
    // A word typed AFTER a word that comes later in transcript is ignored.
    const next = new Set<number>();
    let cursor = 0;
    for (const token of tokens) {
      for (let j = cursor; j < words.length; j++) {
        if (normalizeWord(words[j]) === token) {
          next.add(j);
          cursor = j + 1;
          break;
        }
      }
    }

    revealedRef.current = next;
    setRevealedWords(new Set(next));
    if (next.size === words.length && words.length > 0) {
      onSegmentComplete(studyIndex);
    }
  };

  const handleNext = () => { onSkip(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-sm font-medium text-white">Luyện nghe</span>
          {transcript.length > 0 && (
            <span className="ml-auto text-xs text-gray-500">
              {Math.max(0, studyIndex + 1)}/{transcript.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Media controls */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={onReplay}
            title="Replay đoạn này"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Replay
          </button>
          <button
            onClick={onPlayPause}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            {isPlaying
              ? <><Pause className="w-4 h-4" /> Pause</>
              : <><Play className="w-4 h-4" /> Play</>}
          </button>
          <button
            onClick={onSkip}
            title="Đoạn tiếp theo"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">Nhập những gì bạn nghe được</label>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Gõ ở đây..."
            className="w-full bg-[#2D1F47] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none border border-white/10 outline-none focus:border-[#7C3AED] leading-relaxed transition-colors"
          />
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-black font-semibold text-sm hover:bg-[#00BCCC] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Tiếp theo <SkipForward className="w-4 h-4" />
        </button>

        {/* Current segment — words split */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            {isCompleted ? "Đã hoàn thành" : "Đoạn đang phát"}
          </p>
          {currentSegment ? (
            <div className="flex flex-wrap gap-1.5">
              {words.map((word, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleWordClick(word);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-sm border leading-none transition-all duration-300 cursor-pointer hover:opacity-80 ${
                    revealedWords.has(i)
                      ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 text-white font-medium"
                      : "bg-[#2D1F47] border-white/10 text-gray-200 font-mono tracking-widest"
                  }`}
                >
                  {revealedWords.has(i) ? word : "*".repeat(word.length)}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-5 text-center">
              <p className="text-xs text-gray-600">Phát video để bắt đầu luyện tập</p>
            </div>
          )}
        </div>

        {/* Word detail card */}
        {wordDetail && (
          <div className="rounded-xl border border-white/15 bg-[#2D1F47] p-3 flex flex-col gap-2 relative">
            {/* Close */}
            <button
              onClick={() => setWordDetail(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Word + phonetic + audio */}
            <div className="flex items-center gap-2 pr-5">
              <span className="text-base font-bold text-white">{wordDetail.word}</span>
              {wordDetail.phonetic && (
                <span className="text-xs text-gray-400">{wordDetail.phonetic}</span>
              )}
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(wordDetail.word);
                  u.lang = "en-US";
                  u.rate = 0.8;
                  window.speechSynthesis.speak(u);
                }}
                className="ml-auto text-[#00E5FF] hover:opacity-80 transition-opacity flex-shrink-0"
                title="Phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {wordDetail.loading ? (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
              </div>
            ) : wordDetail.error ? (
              <p className="text-xs text-red-400">{wordDetail.error}</p>
            ) : (
              <>
                {/* Bilingual dictionary meanings by part of speech */}
                {wordDetail.dictMeanings.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {wordDetail.dictMeanings.map((m, mi) => (
                      <div key={mi} className="flex items-baseline gap-2">
                        <span className="text-[10px] italic text-[#7C3AED] font-medium flex-shrink-0">{m.partOfSpeech}</span>
                        <span className="text-xs text-white leading-relaxed">{m.translations.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                ) : wordDetail.translation ? (
                  <p className="text-xs text-[#00E5FF] font-medium">{wordDetail.translation}</p>
                ) : (
                  <p className="text-xs text-gray-500 italic">Không tìm thấy từ này</p>
                )}
              </>
            )}

            {/* Add to vocabulary button */}
            {!wordDetail.loading && (
              <button
                onClick={openVocabDialog}
                className="mt-1 flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-[#9D5CF6] transition-colors font-medium"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> Thêm vào từ vựng
              </button>
            )}
          </div>
        )}

        {/* Transcript + translation — shown compactly after completion */}
        {isCompleted && (
          <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
            <p className="text-xs text-gray-400 leading-relaxed">{currentSegment?.text}</p>
            <div className="flex items-start gap-1.5">
              {translationLoading ? (
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" /> Đang dịch...
                </div>
              ) : translation ? (
                <p className="text-xs text-[#00E5FF]/80 leading-relaxed">{translation}</p>
              ) : null}
            </div>
          </div>
        )}
        </div>
      </div>

    {/* ── Vocabulary Dialog ── */}
    {vocabDialog && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-[#1C1132] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-sm font-semibold text-white">Add to Vocabulary</span>
            </div>
            <button onClick={() => setVocabDialog(null)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 flex flex-col gap-3">
            {([
              { label: "Word", key: "word", placeholder: "Enter word..." },
              { label: "Translation", key: "translation", placeholder: "Enter translation..." },
              { label: "Example sentence", key: "example", placeholder: "E.g. She runs every morning." },
              { label: "Note", key: "note", placeholder: "Optional note..." },
            ] as const).map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{label}</label>
                <input
                  value={vocabDialog[key]}
                  onChange={(e) => setVocabDialog((v) => v && { ...v, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-[#2D1F47] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={() => setVocabDialog(null)}
              className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveVocab}
              disabled={vocabDialog.saving || vocabDialog.saved}
              className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {vocabDialog.saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                : vocabDialog.saved ? "✓ Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>
    , document.body)}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const { videoId } = useParams<{ videoId: string }>();
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Video";
  const router = useRouter();

  // ── Saved progress (restored on load) ──
  const [savedProgress, setSavedProgress] = useState<number>(0);
  const savedProgressRef = useRef<number>(0);   // always up-to-date, safe inside closures
  const playerReadyRef = useRef<boolean>(false); // true once onReady fired
  const progressSavedRef = useRef(false);
  const durationRef = useRef<number>(0); // total video duration in seconds

  // Load saved progress from backend when page mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`http://localhost:5000/api/saved-video/${videoId}/progress-get`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.progressTime > 0) {
          savedProgressRef.current = d.progressTime;
          setSavedProgress(d.progressTime);
        }
      })
      .catch(() => {});
  }, [videoId]);

  // If progress-get finishes AFTER player is already ready → seek now
  useEffect(() => {
    if (savedProgress > 3 && playerReadyRef.current && playerRef.current?.seekTo) {
      playerRef.current.seekTo(savedProgress, true);
    }
  }, [savedProgress]);

  // Save progress to backend (called on unmount & periodically)
  const saveProgressToBackend = useCallback((time: number, segment: string) => {
    if (time < 3) return; // don't save if barely started
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = JSON.stringify({
      progressTime: Math.floor(time),
      progressSegment: segment,
      duration: durationRef.current,
    });
    // Always use fetch + keepalive — sendBeacon cannot send Authorization headers
    fetch(`http://localhost:5000/api/saved-video/${videoId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [videoId]);

  // ── Transcript ──
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(true);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  useEffect(() => {
    setTranscriptLoading(true);
    setTranscriptError(null);
    fetch(`http://localhost:5000/api/video/transcript/${videoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTranscript(data.transcript);
        else setTranscriptError(data.message || "Không có phụ đề");
      })
      .catch(() => setTranscriptError("Không thể kết nối server"))
      .finally(() => setTranscriptLoading(false));

    // Record practice session — updates lastPracticed & study streak
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`http://localhost:5000/api/saved-video/${videoId}/practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        }),
      }).catch(() => {});
    }
  }, [videoId]);

  // ── YouTube Player ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [studyIndex, setStudyIndex] = useState(-1);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevActiveRef = useRef(-1);
  const transcriptRef = useRef<TranscriptItem[]>([]);
  transcriptRef.current = transcript;

  // Auto-save progress every 10s while playing
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      const ct = playerRef.current?.getCurrentTime?.() ?? 0;
      if (ct > 3) {
        const tr = transcriptRef.current;
        let seg = "";
        for (let i = tr.length - 1; i >= 0; i--) {
          if (parseTime(tr[i].time) <= ct) { seg = tr[i].text; break; }
        }
        saveProgressToBackend(ct, seg);
      }
    }, 10000);
    return () => {
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    };
  }, [saveProgressToBackend]);

  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!playerRef.current?.getCurrentTime) return;
        const ct: number = playerRef.current.getCurrentTime();
        const tr = transcriptRef.current;

        // Compute which segment we're currently in
        let newActive = -1;
        for (let i = 0; i < tr.length; i++) {
          if (parseTime(tr[i].time) <= ct) newActive = i;
        }

        // Auto-pause when a segment ends (video enters the next segment)
        if (
          newActive !== prevActiveRef.current &&
          newActive > prevActiveRef.current &&
          prevActiveRef.current >= 0
        ) {
          const doneSeg = prevActiveRef.current;
          playerRef.current.seekTo(parseTime(tr[doneSeg].time), true);
          playerRef.current.pauseVideo();
          setStudyIndex(doneSeg);
          // keep prevActiveRef stable so next poll doesn’t re-trigger
        } else {
          prevActiveRef.current = newActive;
          setCurrentTime(ct);
        }
      }, 200);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const loadPlayer = () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            // Capture total duration
            const dur = playerRef.current?.getDuration?.() ?? 0;
            if (dur > 0) durationRef.current = dur;
            // Read from ref — always has the latest value regardless of fetch timing
            if (savedProgressRef.current > 3) {
              playerRef.current?.seekTo?.(savedProgressRef.current, true);
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            const playing = e.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(playing);
            if (playing) startPolling();
            else stopPolling();
          },
        },
      });
    };

    if (window.YT?.Player) {
      loadPlayer();
    } else {
      window.onYouTubeIframeAPIReady = loadPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      stopPolling();
      // Save progress on unmount
      const ct = playerRef.current?.getCurrentTime?.() ?? 0;
      if (ct > 3) {
        const tr = transcriptRef.current;
        let seg = "";
        for (let i = tr.length - 1; i >= 0; i--) {
          if (parseTime(tr[i].time) <= ct) { seg = tr[i].text; break; }
        }
        saveProgressToBackend(ct, seg);
      }
    };
  }, [videoId, saveProgressToBackend]);

  // Active transcript index (last item whose start time ≤ current playback time)
  const activeIndex = transcript.reduce<number>((best, item, i) => {
    return parseTime(item.time) <= currentTime ? i : best;
  }, -1);

  // Seek (left panel click)
  const handleSeek = useCallback((seconds: number) => {
    if (!playerRef.current?.seekTo) return;
    playerRef.current.seekTo(seconds, true);
    playerRef.current?.playVideo?.();
    // Find which segment this time belongs to and set as study segment
    let target = 0;
    for (let i = 0; i < transcript.length; i++) {
      if (parseTime(transcript[i].time) <= seconds) target = i;
    }
    setStudyIndex(target);
    prevActiveRef.current = target; // treat as starting fresh from this segment
  }, [transcript]);

  // Dictation controls
  const handlePlayPause = useCallback(() => {
    if (isPlaying) playerRef.current?.pauseVideo?.();
    else playerRef.current?.playVideo?.();
  }, [isPlaying]);

  const handleReplay = useCallback(() => {
    const idx = studyIndex >= 0 ? studyIndex : 0;
    if (transcript[idx]) {
      playerRef.current?.seekTo?.(parseTime(transcript[idx].time), true);
      playerRef.current?.playVideo?.();
    }
  }, [studyIndex, transcript]);

  const handleSkip = useCallback(() => {
    const curIdx = studyIndex >= 0 ? studyIndex : 0;
    const nextIdx = curIdx + 1;
    // Mark current segment as completed
    setCompletedSegments((prev) => new Set([...prev, curIdx]));
    if (nextIdx < transcript.length) {
      setStudyIndex(nextIdx);
      prevActiveRef.current = nextIdx;
      playerRef.current?.seekTo?.(parseTime(transcript[nextIdx].time), true);
      playerRef.current?.playVideo?.();
    }
  }, [studyIndex, transcript]);

  const handleSegmentComplete = useCallback((idx: number) => {
    setCompletedSegments((prev) => new Set([...prev, idx]));
    // Don’t auto-advance — DictationPanel will show translation, user clicks Tiếp theo
  }, []);
  // Review a completed segment from the left panel (no auto-play)
  const handleReview = useCallback((idx: number) => {
    setStudyIndex(idx);
    prevActiveRef.current = idx;
    if (transcript[idx]) {
      playerRef.current?.seekTo?.(parseTime(transcript[idx].time), true);
    }
  }, [transcript]);
  return (
    <div className="flex h-full bg-gradient-to-br from-[#3E2465] to-[#1C1642]">
      {/* ── LEFT PANEL ── */}
      <aside className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col bg-[#1C1132]/60 backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>
        <LeftPanel
          videoId={videoId}
          transcript={transcript}
          loading={transcriptLoading}
          error={transcriptError}
          activeIndex={activeIndex}
          onSeek={handleSeek}
          onReview={handleReview}
          completedSegments={completedSegments}
        />
      </aside>

      {/* ── MIDDLE — VIDEO ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Video */}
        <div className="flex-1 bg-black relative">
          <div id="yt-player" className="absolute inset-0 w-full h-full" />
        </div>

        {/* Bottom bar */}
        <div className="flex-shrink-0 bg-[#1C1132]/80 border-t border-white/10 px-6 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <p className="text-white text-sm font-medium line-clamp-1 flex-1">{title}</p>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Chế độ luyện tập
          </span>
        </div>
      </main>

      {/* ── RIGHT PANEL ── */}
      <aside className="w-80 flex-shrink-0 border-l border-white/10 flex flex-col bg-[#1C1132]/60 backdrop-blur-sm">
        <DictationPanel
          studyIndex={studyIndex}
          transcript={transcript}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onReplay={handleReplay}
          onSkip={handleSkip}
          videoId={videoId}
          videoTitle={title}
          onSegmentComplete={handleSegmentComplete}
          completedSegments={completedSegments}
        />
      </aside>
    </div>
  );
}

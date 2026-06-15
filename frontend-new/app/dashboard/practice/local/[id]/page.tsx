"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Headphones,
  RotateCcw,
  Lightbulb,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  Volume2,
  X,
  BookmarkPlus,
  MessageSquare,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface TranscriptItem {
  time: string;
  text: string;
}

function parseTime(t: string): number {
  const parts = t.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

const normalizeWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel({
  transcript,
  loading,
  error,
  activeIndex,
  onSeek,
  onReview,
  completedSegments,
}: {
  transcript: TranscriptItem[];
  loading: boolean;
  error: string | null;
  activeIndex: number;
  onSeek: (s: number) => void;
  onReview: (i: number) => void;
  completedSegments: Set<number>;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex < 0) return;
    const container = scrollRef.current;
    const item = itemRefs.current[activeIndex];
    if (!container || !item) return;
    const top = container.scrollTop,
      bottom = top + container.clientHeight;
    const iTop = item.offsetTop,
      iBot = iTop + item.offsetHeight;
    if (iTop < top || iBot > bottom) {
      container.scrollTo({
        top: iTop - container.clientHeight / 2 + item.offsetHeight / 2,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const checkedCount = transcript.filter(
    (_, i) => !!checked[i] || completedSegments.has(i),
  ).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#00E5FF]" />
        <span className="text-sm font-medium text-white">Transcript</span>
        {!loading && transcript.length > 0 && (
          <span className="ml-auto text-xs text-gray-500">
            {transcript.length} đoạn
          </span>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
            <p className="text-xs">Đang tải transcript...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : (
          <>
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
                style={{
                  width: `${transcript.length ? (checkedCount / transcript.length) * 100 : 0}%`,
                }}
              />
            </div>
            {transcript.map((line, i) => {
              const isActive = i === activeIndex;
              const isComplete = completedSegments.has(i);
              const isChecked = !!checked[i] || isComplete;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  onClick={() =>
                    isComplete ? onReview(i) : onSeek(parseTime(line.time))
                  }
                  className={`flex gap-3 rounded-xl p-3 cursor-pointer transition-all select-none border ${
                    isActive
                      ? "bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                      : isChecked
                        ? "bg-[#00E5FF]/10 border-[#00E5FF]/30"
                        : "bg-[#2D1F47]/40 border-transparent hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setChecked((p) => ({ ...p, [i]: !p[i] }));
                    }}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      isChecked
                        ? "border-[#00E5FF] bg-[#00E5FF]"
                        : "border-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-3 h-3 text-black"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
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
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold ${isActive ? "text-[#00E5FF]" : "text-gray-500"}`}
                      >
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
                        <span className="text-[10px] text-[#00E5FF] font-bold animate-pulse">
                          ▶
                        </span>
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

// ─── Dictation Panel ──────────────────────────────────────────────────────────
function DictationPanel({
  videoTitle,
  studyIndex,
  transcript,
  isPlaying,
  onPlayPause,
  onReplay,
  onSkip,
  onSegmentComplete,
  completedSegments,
}: {
  videoTitle: string;
  studyIndex: number;
  transcript: TranscriptItem[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplay: () => void;
  onSkip: () => void;
  onSegmentComplete: (i: number) => void;
  completedSegments: Set<number>;
}) {
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
    word: string;
    phonetic: string;
    translation: string;
    example: string;
    note: string;
    videoTitle: string;
    segmentTime: string;
    saving: boolean;
    saved: boolean;
  } | null>(null);

  const currentSegment = studyIndex >= 0 ? transcript[studyIndex] : null;
  const words = (currentSegment?.text.trim().split(/\s+/) ?? [])
    .map((w) => w.replace(/^[.,!?;:'"()\[\]—…\-]+|[.,!?;:'"()\[\]—…\-]+$/g, ""))
    .filter(Boolean);

  useEffect(() => {
    setInput("");
    revealedRef.current = new Set();
    setRevealedWords(new Set());
    setTranslation(null);
    setTranslationLoading(false);
    setIsCompleted(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [studyIndex]);

  useEffect(() => {
    if (!completedSegments.has(studyIndex) || studyIndex < 0) return;
    const seg = transcript[studyIndex];
    if (!seg) return;
    const ws = (seg.text.trim().split(/\s+/) ?? [])
      .map((w) =>
        w.replace(/^[.,!?;:'"()\[\]—…\-]+|[.,!?;:'"()\[\]—…\-]+$/g, ""),
      )
      .filter(Boolean);
    const all = new Set<number>(ws.map((_, i) => i));
    revealedRef.current = all;
    setRevealedWords(all);
    setIsCompleted(true);
    setTranslationLoading(true);
    setTranslation(null);
    fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(seg.text)}`,
    )
      .then((r) => r.json())
      .then((data) =>
        setTranslation(
          (data[0] as Array<[string]>).map((item) => item[0]).join(""),
        ),
      )
      .catch(() => setTranslation("(Không thể dịch)"))
      .finally(() => setTranslationLoading(false));
  }, [studyIndex, completedSegments, transcript]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!words.length || isCompleted) return;
    const tokens = value.split(/\s+/).map(normalizeWord).filter(Boolean);
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
    if (next.size === words.length && words.length > 0)
      onSegmentComplete(studyIndex);
  };

  const handleWordClick = (word: string) => {
    const normalized = word.toLowerCase().replace(/[^a-z'-]/g, "");
    if (!normalized) return;
    setWordDetail({
      word: normalized,
      phonetic: null,
      dictMeanings: [],
      translation: null,
      loading: true,
      error: null,
    });
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/dictionary/lookup?word=${encodeURIComponent(normalized)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setWordDetail(
            (p) => p && { ...p, loading: false, error: "Lỗi kết nối server" },
          );
          return;
        }
        setWordDetail({
          word: normalized,
          phonetic: data.phonetic ?? null,
          dictMeanings: data.dictMeanings ?? [],
          translation: data.translation ?? null,
          loading: false,
          error: null,
        });
      })
      .catch(() =>
        setWordDetail(
          (p) => p && { ...p, loading: false, error: "Lỗi kết nối server" },
        ),
      );
  };

  const openVocabDialog = () => {
    if (!wordDetail) return;
    const trans =
      wordDetail.dictMeanings.length > 0
        ? wordDetail.dictMeanings
            .map((m) => `(${m.partOfSpeech}) ${m.translations.join(", ")}`)
            .join(" | ")
        : (wordDetail.translation ?? "");
    const seg = studyIndex >= 0 ? transcript[studyIndex] : null;
    setVocabDialog({
      word: wordDetail.word,
      phonetic: wordDetail.phonetic ?? "",
      translation: trans,
      example: seg?.text ?? "",
      note: "",
      videoTitle,
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          word: vocabDialog.word,
          phonetic: vocabDialog.phonetic,
          translation: vocabDialog.translation,
          example: vocabDialog.example,
          note: vocabDialog.note,
          videoTitle: vocabDialog.videoTitle,
          segmentTime: vocabDialog.segmentTime,
        }),
      });
      setVocabDialog((v) => v && { ...v, saving: false, saved: true });
      setTimeout(() => setVocabDialog(null), 800);
    } catch {
      setVocabDialog((v) => v && { ...v, saving: false });
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
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
          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {[
              {
                label: "Replay",
                icon: <RotateCcw className="w-4 h-4" />,
                action: onReplay,
              },
              {
                label: isPlaying ? "Pause" : "Play",
                icon: isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                ),
                action: onPlayPause,
              },
              {
                label: "Skip",
                icon: <SkipForward className="w-4 h-4" />,
                action: onSkip,
              },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm"
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">
              Nhập những gì bạn nghe được
            </label>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSkip();
                }
              }}
              rows={3}
              placeholder="Gõ ở đây..."
              className="w-full bg-[#2D1F47] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none border border-white/10 outline-none focus:border-[#7C3AED] leading-relaxed transition-colors"
            />
          </div>

          <button
            onClick={onSkip}
            className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-black font-semibold text-sm hover:bg-[#00BCCC] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Tiếp theo <SkipForward className="w-4 h-4" />
          </button>

          {/* Words */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {isCompleted ? "Đã hoàn thành" : "Đoạn đang phát"}
            </p>
            {currentSegment ? (
              <div className="flex flex-wrap gap-1.5">
                {words.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordClick(word)}
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
                <p className="text-xs text-gray-600">
                  Phát video để bắt đầu luyện tập
                </p>
              </div>
            )}
          </div>

          {/* Word detail */}
          {wordDetail && (
            <div className="rounded-xl border border-white/15 bg-[#2D1F47] p-3 flex flex-col gap-2 relative">
              <button
                onClick={() => setWordDetail(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2 pr-5">
                <span className="text-base font-bold text-white">
                  {wordDetail.word}
                </span>
                {wordDetail.phonetic && (
                  <span className="text-xs text-gray-400">
                    {wordDetail.phonetic}
                  </span>
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
                  {wordDetail.dictMeanings.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {wordDetail.dictMeanings.map((m, mi) => (
                        <div key={mi} className="flex items-baseline gap-2">
                          <span className="text-[10px] italic text-[#7C3AED] font-medium flex-shrink-0">
                            {m.partOfSpeech}
                          </span>
                          <span className="text-xs text-white leading-relaxed">
                            {m.translations.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : wordDetail.translation ? (
                    <p className="text-xs text-[#00E5FF] font-medium">
                      {wordDetail.translation}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Không tìm thấy từ này
                    </p>
                  )}
                </>
              )}
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

          {/* Completed: transcript + translation */}
          {isCompleted && (
            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentSegment?.text}
              </p>
              {translationLoading ? (
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />{" "}
                  Đang dịch...
                </div>
              ) : translation ? (
                <p className="text-xs text-[#00E5FF]/80 leading-relaxed">
                  {translation}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Vocab Dialog */}
      {vocabDialog &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#1C1132] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-sm font-semibold text-white">
                    Add to Vocabulary
                  </span>
                </div>
                <button
                  onClick={() => setVocabDialog(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {(
                  [
                    {
                      label: "Word",
                      key: "word",
                      placeholder: "Enter word...",
                    },
                    {
                      label: "Translation",
                      key: "translation",
                      placeholder: "Enter translation...",
                    },
                    {
                      label: "Example sentence",
                      key: "example",
                      placeholder: "E.g. She runs every morning.",
                    },
                    {
                      label: "Note",
                      key: "note",
                      placeholder: "Optional note...",
                    },
                  ] as const
                ).map(({ label, key, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      value={vocabDialog[key]}
                      onChange={(e) =>
                        setVocabDialog(
                          (v) => v && { ...v, [key]: e.target.value },
                        )
                      }
                      placeholder={placeholder}
                      className="w-full bg-[#2D1F47] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 border border-white/10 outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                ))}
              </div>
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
                  {vocabDialog.saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : vocabDialog.saved ? (
                    "✓ Saved!"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LocalPracticePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const titleParam = searchParams.get("title") || "Video";

  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    videoUrl: string;
  } | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(true);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [studyIndex, setStudyIndex] = useState(-1);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(
    new Set(),
  );
  const prevActiveRef = useRef(-1);
  const transcriptRef = useRef<TranscriptItem[]>([]);
  transcriptRef.current = transcript;

  // Load video info + transcript
  useEffect(() => {
    setTranscriptLoading(true);
    const token = localStorage.getItem("token");
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/video/local/${id}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setVideoInfo({ title: data.title, videoUrl: data.videoUrl });
          if (data.transcript?.length > 0) {
            setTranscript(data.transcript);
          } else {
            setTranscriptError("Video này chưa có transcript");
          }
          // Record practice to update lastPracticed + streak
          if (token) {
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/saved-video/${id}/local-practice`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              },
            ).catch(() => {});
          }
        } else {
          setTranscriptError(data.message || "Không thể tải thông tin video");
        }
      })
      .catch(() => setTranscriptError("Không thể kết nối server"))
      .finally(() => setTranscriptLoading(false));
  }, [id]);

  // Sync playback time and auto-pause at segment boundaries
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const ct = video.currentTime;
    const tr = transcriptRef.current;
    if (tr.length === 0) return;

    let newActive = -1;
    for (let i = 0; i < tr.length; i++) {
      if (parseTime(tr[i].time) <= ct) newActive = i;
    }

    // Auto-pause when transitioning into a new segment
    if (
      newActive !== prevActiveRef.current &&
      newActive > prevActiveRef.current &&
      prevActiveRef.current >= 0
    ) {
      const doneSeg = prevActiveRef.current;
      // Seek back to the start of the completed segment and pause
      video.currentTime = parseTime(tr[doneSeg].time);
      video.pause();
      setStudyIndex(doneSeg);
      // prevActiveRef stays at doneSeg to prevent re-trigger on next timeupdate
    } else {
      if (newActive >= 0) prevActiveRef.current = newActive;
      setCurrentTime(ct);
    }
  }, []);

  // Re-run whenever videoInfo becomes available so the <video> element exists
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [handleTimeUpdate, videoInfo]);

  // Set first segment as active as soon as transcript loads
  useEffect(() => {
    if (transcript.length > 0 && studyIndex < 0) {
      setStudyIndex(0);
      prevActiveRef.current = 0;
    }
  }, [transcript]);

  const activeIndex = transcript.reduce<number>((best, item, i) => {
    return parseTime(item.time) <= currentTime ? i : best;
  }, -1);

  const handleSeek = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = seconds;
      video.play().catch(() => {});
      let target = 0;
      for (let i = 0; i < transcript.length; i++) {
        if (parseTime(transcript[i].time) <= seconds) target = i;
      }
      setStudyIndex(target);
      prevActiveRef.current = target;
    },
    [transcript],
  );

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const handleReplay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const idx = studyIndex >= 0 ? studyIndex : 0;
    if (transcript[idx]) {
      video.currentTime = parseTime(transcript[idx].time);
      video.play().catch(() => {});
    }
  }, [studyIndex, transcript]);

  const saveProgressRef = useRef<(segIdx: number) => void>(() => {});

  const saveProgress = useCallback(
    (segIdx: number) => {
      const video = videoRef.current;
      const token = localStorage.getItem("token");
      if (!token || !video) return;
      const time = Math.floor(video.currentTime);
      const dur = isFinite(video.duration) ? Math.floor(video.duration) : 0;
      const segText = transcript[segIdx]?.text || "";
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/saved-video/${id}/local-progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progressTime: time,
            progressSegment: segText,
            duration: dur,
          }),
        },
      ).catch(() => {});
    },
    [id, transcript],
  );

  saveProgressRef.current = saveProgress;

  const handleSkip = useCallback(() => {
    const curIdx = studyIndex >= 0 ? studyIndex : 0;
    const nextIdx = curIdx + 1;
    setCompletedSegments((prev) => new Set([...prev, curIdx]));
    saveProgressRef.current(curIdx);
    if (nextIdx < transcript.length && videoRef.current) {
      setStudyIndex(nextIdx);
      prevActiveRef.current = nextIdx;
      videoRef.current.currentTime = parseTime(transcript[nextIdx].time);
      videoRef.current.play().catch(() => {});
    }
  }, [studyIndex, transcript]);

  const handleSegmentComplete = useCallback((idx: number) => {
    setCompletedSegments((prev) => new Set([...prev, idx]));
    saveProgressRef.current(idx);
  }, []);

  const handleReview = useCallback(
    (idx: number) => {
      setStudyIndex(idx);
      prevActiveRef.current = idx;
      if (transcript[idx] && videoRef.current) {
        videoRef.current.currentTime = parseTime(transcript[idx].time);
      }
    },
    [transcript],
  );

  const title = videoInfo?.title || titleParam;

  return (
    <div className="flex h-full bg-gradient-to-br from-[#3E2465] to-[#1C1642]">
      {/* LEFT PANEL */}
      <aside className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col bg-[#1C1132]/60 backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>
        <LeftPanel
          transcript={transcript}
          loading={transcriptLoading}
          error={transcriptError}
          activeIndex={activeIndex}
          onSeek={handleSeek}
          onReview={handleReview}
          completedSegments={completedSegments}
        />
      </aside>

      {/* MIDDLE — VIDEO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-black relative">
          {videoInfo && (
            <video
              ref={videoRef}
              src={videoInfo.videoUrl}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {!videoInfo && !transcriptLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
            </div>
          )}
        </div>
        <div className="flex-shrink-0 bg-[#1C1132]/80 border-t border-white/10 px-6 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
          <p className="text-white text-sm font-medium line-clamp-1 flex-1">
            {title}
          </p>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Chế độ luyện tập
          </span>
        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside className="w-80 flex-shrink-0 border-l border-white/10 flex flex-col bg-[#1C1132]/60 backdrop-blur-sm">
        <DictationPanel
          videoTitle={title}
          studyIndex={studyIndex}
          transcript={transcript}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onReplay={handleReplay}
          onSkip={handleSkip}
          onSegmentComplete={handleSegmentComplete}
          completedSegments={completedSegments}
        />
      </aside>
    </div>
  );
}

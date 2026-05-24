"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ENGLISH_LEVELS = [
  { value: "beginner", label: "Mới bắt đầu", desc: "Chưa biết gì hoặc biết rất ít" },
  { value: "elementary", label: "Cơ bản", desc: "Biết một số từ và câu đơn giản" },
  { value: "intermediate", label: "Trung cấp", desc: "Có thể giao tiếp thông thường" },
  { value: "upper-intermediate", label: "Trên trung cấp", desc: "Khá tự tin khi giao tiếp" },
  { value: "advanced", label: "Nâng cao", desc: "Giao tiếp tốt, muốn hoàn thiện hơn" },
];

const GOALS = [
  { value: "communication", label: "💬 Giao tiếp hàng ngày" },
  { value: "ielts", label: "📝 Luyện thi IELTS" },
  { value: "toeic", label: "📋 Luyện thi TOEIC" },
  { value: "listening", label: "👂 Nghe hiểu" },
  { value: "pronunciation", label: "🗣️ Cải thiện phát âm" },
  { value: "travel", label: "✈️ Du lịch nước ngoài" },
  { value: "job", label: "💼 Phỏng vấn xin việc" },
  { value: "it", label: "💻 Tiếng Anh IT" },
  { value: "office", label: "🏢 Tiếng Anh văn phòng" },
  { value: "academic", label: "🎓 Tiếng Anh học thuật" },
];

const INTERESTS = [
  { value: "music", label: "🎵 Âm nhạc" },
  { value: "sports", label: "⚽ Thể thao" },
  { value: "tech", label: "🔬 Công nghệ" },
  { value: "movies", label: "🎬 Phim ảnh" },
  { value: "food", label: "🍜 Ẩm thực" },
  { value: "travel", label: "🗺️ Du lịch" },
  { value: "gaming", label: "🎮 Game" },
  { value: "news", label: "📰 Thời sự" },
  { value: "business", label: "📊 Kinh doanh" },
  { value: "science", label: "🔭 Khoa học" },
  { value: "fashion", label: "👗 Thời trang" },
  { value: "health", label: "🏃 Sức khoẻ" },
];

const LEARNING_STYLES = [
  { value: "short-video", label: "📱 Video ngắn (YouTube Shorts, Reels)" },
  { value: "podcast", label: "🎙️ Podcast" },
  { value: "movie", label: "🎥 Phim điện ảnh" },
  { value: "series", label: "📺 Series / Phim bộ" },
  { value: "documentary", label: "🌍 Phim tài liệu" },
  { value: "music", label: "🎶 Học qua âm nhạc" },
  { value: "news-video", label: "📡 Video tin tức" },
  { value: "talk-show", label: "🎤 Talk show / Phỏng vấn" },
];

const STUDY_TIMES = [
  { value: 10, label: "10 phút" },
  { value: 20, label: "20 phút" },
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
  { value: 60, label: "1 giờ" },
  { value: 90, label: "1.5 giờ" },
  { value: 120, label: "2 giờ+" },
];

// ─── Multi-select component ───────────────────────────────────────────────────

function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={`px-3 py-2 rounded-xl text-sm border transition-all ${
              active
                ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] font-medium"
                : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
            }`}
          >
            {active && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [age, setAge] = useState("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState<string[]>([]);
  const [studyTimeMinutes, setStudyTimeMinutes] = useState<number | null>(null);

  const STEPS = [
    { title: "Bạn bao nhiêu tuổi?", subtitle: "Giúp chúng tôi đề xuất nội dung phù hợp.", valid: () => !!age && Number(age) >= 5 && Number(age) <= 100 },
    { title: "Trình độ tiếng Anh?", subtitle: "Chọn mức gần nhất với bạn hiện tại.", valid: () => !!englishLevel },
    { title: "Mục tiêu học tiếng Anh?", subtitle: "Chọn một hoặc nhiều mục tiêu bạn hướng tới.", valid: () => goals.length > 0 },
    { title: "Sở thích cá nhân?", subtitle: "Chúng tôi sẽ gợi ý video theo chủ đề bạn yêu thích.", valid: () => interests.length > 0 },
    { title: "Phong cách học tập?", subtitle: "Bạn thích học qua hình thức nào?", valid: () => learningStyle.length > 0 },
    { title: "Mỗi ngày bạn học bao lâu?", subtitle: "Giúp chúng tôi lập kế hoạch phù hợp.", valid: () => studyTimeMinutes !== null },
  ];

  const isLast = step === STEPS.length - 1;
  const canNext = STEPS[step].valid();

  const handleNext = () => {
    if (!canNext) return;
    if (isLast) handleSubmit();
    else setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/signin"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ age: Number(age), englishLevel, goals, interests, learningStyle, studyTimeMinutes }),
      });
      const data = await res.json();
      if (data.success) {
        const stored = localStorage.getItem("user");
        if (stored) localStorage.setItem("user", JSON.stringify({ ...JSON.parse(stored), onboardingCompleted: true }));
        router.push("/dashboard");
      }
    } catch {
      // let user retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0A1F] flex flex-col items-center justify-center p-4">
      {/* Logo + title */}
      <div className="mb-8 text-center">
        <p className="text-[#00E5FF] text-sm font-semibold tracking-widest uppercase mb-1">SmartVideo</p>
        <h1 className="text-white text-2xl font-bold">Hãy cho chúng tôi biết về bạn 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Chỉ mất khoảng 1 phút để cá nhân hoá trải nghiệm học của bạn.</p>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Bước {step + 1} / {STEPS.length}</span>
            <span className="text-[#00E5FF]">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                animate={{ backgroundColor: i <= step ? "#00E5FF" : "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-[#1C1132] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-white">{STEPS[step].title}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{STEPS[step].subtitle}</p>
              </div>

              {step === 0 && (
                <input
                  autoFocus
                  type="number"
                  min={5}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="Nhập tuổi của bạn..."
                  className="w-full bg-white/5 border border-white/15 text-white text-lg rounded-xl px-5 py-3.5 outline-none focus:border-[#00E5FF]/60 transition placeholder:text-gray-600"
                />
              )}

              {step === 1 && (
                <div className="space-y-2">
                  {ENGLISH_LEVELS.map((lv) => (
                    <button
                      key={lv.value}
                      type="button"
                      onClick={() => setEnglishLevel(lv.value)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all ${
                        englishLevel === lv.value
                          ? "bg-[#00E5FF]/10 border-[#00E5FF] text-white"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{lv.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{lv.desc}</p>
                      </div>
                      {englishLevel === lv.value && (
                        <div className="w-5 h-5 rounded-full bg-[#00E5FF] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && <MultiSelect options={GOALS} selected={goals} onChange={setGoals} />}
              {step === 3 && <MultiSelect options={INTERESTS} selected={interests} onChange={setInterests} />}
              {step === 4 && <MultiSelect options={LEARNING_STYLES} selected={learningStyle} onChange={setLearningStyle} />}

              {step === 5 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {STUDY_TIMES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setStudyTimeMinutes(t.value)}
                      className={`py-4 rounded-xl border text-sm font-medium transition-all ${
                        studyTimeMinutes === t.value
                          ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]"
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-0 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext || submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
              ) : isLast ? (
                <><Check className="w-4 h-4" /> Bắt đầu học!</>
              ) : (
                <>Tiếp theo <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-xs text-gray-600 hover:text-gray-400 transition underline underline-offset-2"
          >
            Bỏ qua, tôi sẽ điền sau
          </button>
        </p>
      </div>
    </div>
  );
}

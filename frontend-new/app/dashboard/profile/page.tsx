"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  Video,
  BookOpen,
  Flame,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Bell,
  BellOff,
  Trash2,
  Calendar,
  Edit3,
  Loader2,
  PlayCircle,
  GraduationCap,
  Check,
} from "lucide-react";

// ─── Survey constants ─────────────────────────────────────────────────────────

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

// ─── Multi-select helper ──────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SurveyData {
  age: number | null;
  englishLevel: string | null;
  goals: string[];
  interests: string[];
  learningStyle: string[];
  studyTimeMinutes: number | null;
}

interface UserProfile {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  is_premium: boolean;
  total_points: number;
  total_study_time: number;
  created_at: string;
  survey?: SurveyData;
}

interface UserStats {
  videosCount: number;
  vocabTotal: number;
  vocabLearned: number;
  study_streak: number;
}

interface RecentVideo {
  _id: string;
  youtubeId: string;
  title: string;
  thumbnail: string | null;
  lastPracticed: string;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  // Remote user state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Stats
  const [stats, setStats] = useState<UserStats>({ videosCount: 0, vocabTotal: 0, vocabLearned: 0, study_streak: 0 });
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  // Survey
  const [surveyAge, setSurveyAge] = useState<string>("");
  const [surveyLevel, setSurveyLevel] = useState<string>("");
  const [surveyGoals, setSurveyGoals] = useState<string[]>([]);
  const [surveyInterests, setSurveyInterests] = useState<string[]>([]);
  const [surveyStyle, setSurveyStyle] = useState<string[]>([]);
  const [surveyTime, setSurveyTime] = useState<number | null>(null);
  const [surveySaving, setSurveySaving] = useState(false);
  const [surveySaved, setSurveySaved] = useState(false);
  const [surveyError, setSurveyError] = useState("");
  const [surveyEditing, setSurveyEditing] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [streakReminder, setStreakReminder] = useState(true);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ── Fetch user from API on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFetchError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setName(data.user.fullname);
          setEmail(data.user.email);
          // Load survey
          const s = data.user.survey;
          if (s) {
            setSurveyAge(s.age != null ? String(s.age) : "");
            setSurveyLevel(s.englishLevel ?? "");
            setSurveyGoals(s.goals ?? []);
            setSurveyInterests(s.interests ?? []);
            setSurveyStyle(s.learningStyle ?? []);
            setSurveyTime(s.studyTimeMinutes ?? null);
          }
        } else {
          setFetchError(data.message || "Không thể tải thông tin.");
        }
      })
      .catch(() => setFetchError("Không thể kết nối đến server."))
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch stats + recent videos on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setStatsLoading(false); return; }
    fetch("http://localhost:5000/api/auth/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentVideos(data.recentVideos || []);
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullname: name, email }),
      });
      const data = await res.json();
      if (!data.success) { setProfileError(data.message); return; }
      setUser(data.user);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setProfileError("Không thể kết nối đến server.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 8) { setPwError("Mật khẩu mới phải có ít nhất 8 ký tự."); return; }
    if (newPw !== confirmPw) { setPwError("Mật khẩu mới không khớp."); return; }
    const token = localStorage.getItem("token");
    if (!token) return;
    setPwSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!data.success) { setPwError(data.message); return; }
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 3000);
    } catch {
      setPwError("Không thể kết nối đến server.");
    } finally {
      setPwSaving(false);
    }
  }

  function handleCancelSurvey() {
    const s = user?.survey;
    setSurveyAge(s?.age != null ? String(s.age) : "");
    setSurveyLevel(s?.englishLevel ?? "");
    setSurveyGoals(s?.goals ?? []);
    setSurveyInterests(s?.interests ?? []);
    setSurveyStyle(s?.learningStyle ?? []);
    setSurveyTime(s?.studyTimeMinutes ?? null);
    setSurveyError("");
    setSurveyEditing(false);
  }

  async function handleSaveSurvey(e: React.FormEvent) {
    e.preventDefault();
    setSurveyError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    setSurveySaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/survey", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          age: surveyAge ? Number(surveyAge) : null,
          englishLevel: surveyLevel || null,
          goals: surveyGoals,
          interests: surveyInterests,
          learningStyle: surveyStyle,
          studyTimeMinutes: surveyTime,
        }),
      });
      const data = await res.json();
      if (!data.success) { setSurveyError(data.message); return; }
      setUser(data.user);
      setSurveySaved(true);
      setSurveyEditing(false);
      setTimeout(() => setSurveySaved(false), 3000);
    } catch {
      setSurveyError("Không thể kết nối đến server.");
    } finally {
      setSurveySaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    // Upload
    const token = localStorage.getItem("token");
    if (!token) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("http://localhost:5000/api/auth/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setAvatarPreview(null); // use DB url from user state
      }
    } catch {
      // keep preview, silently fail — user can retry
    } finally {
      setAvatarUploading(false);
      // reset input so same file can be re-selected
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* ── Page title ─────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.</p>
      </div>

      {/* ── Loading / error state ────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
        </div>
      )}
      {!loading && fetchError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-5 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{fetchError}</p>
        </div>
      )}

      {!loading && user && (
        <>
      {/* ── Profile header card ─────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {/* Hidden file input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {(avatarPreview || user.avatar) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview ?? (user.avatar.startsWith("/uploads") ? `http://localhost:5000${user.avatar}` : user.avatar)}
              alt={user.fullname}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B2FBE] flex items-center justify-center text-3xl font-bold text-white select-none">
              {initials}
            </div>
          )}
          <button
            type="button"
            title="Đổi ảnh đại diện"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00E5FF] flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
          >
            {avatarUploading
              ? <Loader2 className="w-4 h-4 text-black animate-spin" />
              : <Camera className="w-4 h-4 text-black" />}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white">{user.fullname}</h2>
          <p className="text-gray-400 text-sm mt-0.5">@{user.username}</p>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            {user.is_premium && (
              <span className="inline-flex items-center gap-1.5 bg-yellow-400/15 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-400/30">
                <Trophy className="w-3 h-3" />
                Premium
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" />
              Tham gia {new Date(user.created_at).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
              🏅 {user.total_points.toLocaleString()} điểm
            </span>
          </div>
        </div>
      </div>

      {/* ── Learning stats ──────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Thống kê học tập</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Video} label="Video đã lưu" value={statsLoading ? 0 : stats.videosCount} color="bg-purple-500" />
          <StatCard icon={BookOpen} label="Từ vựng đã lưu" value={statsLoading ? 0 : stats.vocabTotal} color="bg-blue-500" />
          <StatCard icon={CheckCircle2} label="Từ đã thành thạo" value={statsLoading ? 0 : stats.vocabLearned} color="bg-emerald-500" />
          <StatCard icon={Flame} label="Chuỗi ngày học" value={statsLoading ? 0 : stats.study_streak} color="bg-orange-500" />
        </div>
      </section>

      {/* ── Recent videos ────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Video xem gần đây</h2>
        {statsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
          </div>
        ) : recentVideos.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-8 text-center">
            <p className="text-gray-500 text-sm">Bạn chưa lưu video nào.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
            {recentVideos.map((v) => (
              <div key={v._id} className="flex items-center gap-3 px-5 py-4">
                {v.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail} alt={v.title} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{v.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(v.lastPracticed).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/practice/${v.youtubeId}?title=${encodeURIComponent(v.title)}`)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#00E5FF] hover:text-white bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Luyện tập lại
                </button>
              </div>
            ))}
          </div>
        )}
      </section>



      {/* ── Edit profile ────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-[#00E5FF]" />
          Chỉnh sửa thông tin
        </h2>
        <form onSubmit={handleSaveProfile} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Tên hiển thị</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition"
                  placeholder="Tên của bạn"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition resize-none"
              placeholder="Một vài câu giới thiệu về bạn..."
            />
            <p className="text-xs text-gray-600 text-right">{bio.length}/200</p>
          </div>

          {profileError && (
            <p className="flex items-center gap-1.5 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" /> {profileError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 disabled:opacity-60 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition"
            >
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            {profileSaved && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu!
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ── Survey / Learning preferences ─────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#00E5FF]" />
            Thông tin học tập
          </h2>
          {!surveyEditing && (
            <button
              onClick={() => setSurveyEditing(true)}
              className="inline-flex items-center gap-1.5 text-sm text-[#00E5FF] hover:text-white bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 px-4 py-2 rounded-xl transition"
            >
              <Edit3 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )}
          {surveySaved && !surveyEditing && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Đã lưu!
            </span>
          )}
        </div>

        {/* ── Read-only summary ── */}
        {!surveyEditing && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            {/* Age + Level */}
            <div className="flex flex-wrap gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tuổi</p>
                <p className="text-white font-medium">{surveyAge || <span className="text-gray-500 italic">Chưa điền</span>}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Trình độ tiếng Anh</p>
                <p className="text-white font-medium">
                  {ENGLISH_LEVELS.find((l) => l.value === surveyLevel)?.label ?? <span className="text-gray-500 italic">Chưa chọn</span>}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Thời gian học / ngày</p>
                <p className="text-white font-medium">
                  {STUDY_TIMES.find((t) => t.value === surveyTime)?.label ?? <span className="text-gray-500 italic">Chưa chọn</span>}
                </p>
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Mục tiêu học</p>
              {surveyGoals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {surveyGoals.map((v) => (
                    <span key={v} className="px-3 py-1 rounded-full text-xs bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                      {GOALS.find((g) => g.value === v)?.label ?? v}
                    </span>
                  ))}
                </div>
              ) : <p className="text-gray-500 italic text-sm">Chưa chọn</p>}
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Sở thích</p>
              {surveyInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {surveyInterests.map((v) => (
                    <span key={v} className="px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {INTERESTS.find((i) => i.value === v)?.label ?? v}
                    </span>
                  ))}
                </div>
              ) : <p className="text-gray-500 italic text-sm">Chưa chọn</p>}
            </div>

            {/* Learning style */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Phong cách học</p>
              {surveyStyle.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {surveyStyle.map((v) => (
                    <span key={v} className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {LEARNING_STYLES.find((s) => s.value === v)?.label ?? v}
                    </span>
                  ))}
                </div>
              ) : <p className="text-gray-500 italic text-sm">Chưa chọn</p>}
            </div>
          </div>
        )}

        {/* ── Edit form ── */}
        {surveyEditing && (
          <form onSubmit={handleSaveSurvey} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Tuổi của bạn</label>
              <input
                type="number"
                min={5}
                max={100}
                value={surveyAge}
                onChange={(e) => setSurveyAge(e.target.value)}
                placeholder="Ví dụ: 22"
                className="w-32 bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition"
              />
            </div>

            {/* English level */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Trình độ tiếng Anh</label>
              <div className="flex flex-wrap gap-2">
                {ENGLISH_LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setSurveyLevel(lvl.value)}
                    className={`flex flex-col px-4 py-2.5 rounded-xl text-sm border transition-all text-left ${
                      surveyLevel === lvl.value
                        ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] font-medium"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <span>{lvl.label}</span>
                    <span className="text-xs opacity-60 mt-0.5">{lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Mục tiêu học tiếng Anh</label>
              <MultiSelect options={GOALS} selected={surveyGoals} onChange={setSurveyGoals} />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Sở thích cá nhân</label>
              <MultiSelect options={INTERESTS} selected={surveyInterests} onChange={setSurveyInterests} />
            </div>

            {/* Learning style */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Phong cách học tập</label>
              <MultiSelect options={LEARNING_STYLES} selected={surveyStyle} onChange={setSurveyStyle} />
            </div>

            {/* Study time */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Thời gian học mỗi ngày</label>
              <div className="flex flex-wrap gap-2">
                {STUDY_TIMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSurveyTime(t.value)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      surveyTime === t.value
                        ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] font-medium"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {surveyError && (
              <p className="flex items-center gap-1.5 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" /> {surveyError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={surveySaving}
                className="inline-flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 disabled:opacity-60 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition"
              >
                {surveySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {surveySaving ? "Đang lưu..." : "Lưu thông tin"}
              </button>
              <button
                type="button"
                onClick={handleCancelSurvey}
                disabled={surveySaving}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-60 text-white text-sm px-5 py-2.5 rounded-xl transition"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Change password ──────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#00E5FF]" />
          Đổi mật khẩu
        </h2>
        <form onSubmit={handleChangePassword} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          {[
            { label: "Mật khẩu hiện tại", value: currentPw, setValue: setCurrentPw, show: showCurrent, setShow: setShowCurrent },
            { label: "Mật khẩu mới", value: newPw, setValue: setNewPw, show: showNew, setShow: setShowNew },
            { label: "Xác nhận mật khẩu mới", value: confirmPw, setValue: setConfirmPw, show: showConfirm, setShow: setShowConfirm },
          ].map(({ label, value, setValue, show, setShow }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-sm text-gray-400">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && (
            <p className="flex items-center gap-1.5 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" /> {pwError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pwSaving}
              className="inline-flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 disabled:opacity-60 text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition"
            >
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {pwSaving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
            {pwSaved && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Đã cập nhật!
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ── Notification preferences ─────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00E5FF]" />
          Thông báo
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
          {[
            {
              label: "Thông báo qua email",
              desc: "Nhận cập nhật về tiến độ học và tính năng mới.",
              value: emailNotif,
              toggle: () => setEmailNotif(!emailNotif),
            },
            {
              label: "Nhắc nhở chuỗi ngày học",
              desc: "Nhận thông báo khi bạn sắp mất chuỗi ngày học liên tiếp.",
              value: streakReminder,
              toggle: () => setStreakReminder(!streakReminder),
            },
          ].map(({ label, desc, value, toggle }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex items-start gap-3">
                {value ? (
                  <Bell className="w-5 h-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  value ? "bg-[#00E5FF]" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Danger zone ──────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Vùng nguy hiểm
        </h2>
        <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium">Xóa tài khoản</p>
            <p className="text-gray-400 text-sm mt-0.5">
              Xóa vĩnh viễn tài khoản, toàn bộ video, từ vựng và dữ liệu học tập của bạn.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 font-semibold text-sm px-5 py-2.5 rounded-xl transition whitespace-nowrap flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tài khoản
          </button>
        </div>
      </section>

      {/* ── Delete confirmation modal ─────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#2D1B4E] border border-red-500/40 rounded-2xl p-7 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Xác nhận xóa tài khoản</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hành động này <span className="text-red-400 font-semibold">không thể hoàn tác</span>. Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn. Nhập{" "}
              <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 rounded">XOA TAI KHOAN</span> để xác nhận.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/60 transition"
              placeholder="XOA TAI KHOAN"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                disabled={deleteConfirmText !== "XOA TAI KHOAN"}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

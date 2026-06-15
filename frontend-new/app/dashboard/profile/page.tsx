"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
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
  youtubeId?: string;
  title: string;
  thumbnail: string | null;
  lastPracticed: string;
  isLocal?: boolean;
}

interface HistoryVideo {
  _id: string;
  youtubeId?: string;
  title: string;
  thumbnail: string | null;
  progressTime: number;
  duration: number;
  progressPercent: number;
  isCompleted: boolean;
  lastWatchedAt: string;
  progressSegment: string;
  isLocal?: boolean;
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
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useLang();
  const p = t.profile;

  const ENGLISH_LEVELS = t.profile.survey.levels.map(
    (l: { label: string; desc: string }, i: number) => ({
      value: [
        "beginner",
        "elementary",
        "intermediate",
        "upper-intermediate",
        "advanced",
      ][i],
      label: l.label,
      desc: l.desc,
    }),
  );

  const GOALS = t.profile.survey.goals.map((label: string, i: number) => ({
    value: [
      "communication",
      "ielts",
      "toeic",
      "listening",
      "pronunciation",
      "travel",
      "job",
      "it",
      "office",
      "academic",
    ][i],
    label,
  }));

  const INTERESTS = t.profile.survey.interests.map(
    (label: string, i: number) => ({
      value: [
        "music",
        "sports",
        "tech",
        "movies",
        "food",
        "travel",
        "gaming",
        "news",
        "business",
        "science",
        "fashion",
        "health",
      ][i],
      label,
    }),
  );

  const LEARNING_STYLES = t.profile.survey.styles.map(
    (label: string, i: number) => ({
      value: [
        "short-video",
        "podcast",
        "movie",
        "series",
        "documentary",
        "music",
        "news-video",
        "talk-show",
      ][i],
      label,
    }),
  );

  const STUDY_TIMES = t.profile.survey.studyTimes.map(
    (label: string, i: number) => ({
      value: [10, 20, 30, 45, 60, 90, 120][i],
      label,
    }),
  );

  // Remote user state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Stats
  const [stats, setStats] = useState<UserStats>({
    videosCount: 0,
    vocabTotal: 0,
    vocabLearned: 0,
    study_streak: 0,
  });
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [historyVideos, setHistoryVideos] = useState<HistoryVideo[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
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
  const [streakReminder, setStreakReminder] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState("");

  async function handleToggleStreakReminder() {
    const newValue = !streakReminder;
    setStreakReminder(newValue);
    setNotifSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/auth/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ streakReminderEnabled: newValue }),
      });
    } catch {
      // Revert on failure
      setStreakReminder(!newValue);
    } finally {
      setNotifSaving(false);
    }
  }

  async function handleSendTestEmail() {
    setTestEmailSending(true);
    setTestEmailMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/test-reminder", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTestEmailMsg(data.message);
    } catch {
      setTestEmailMsg("Lỗi kết nối tới server.");
    } finally {
      setTestEmailSending(false);
      setTimeout(() => setTestEmailMsg(""), 5000);
    }
  }

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ── Fetch user from API on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFetchError(p.notLoggedIn);
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
          // Load notification prefs
          setStreakReminder(data.user.streakReminderEnabled ?? false);
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
          setFetchError(data.message || p.loadErr);
        }
      })
      .catch(() => setFetchError(p.connectErr))
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch stats + recent videos on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatsLoading(false);
      return;
    }
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

    // Fetch practice history
    fetch("http://localhost:5000/api/saved-video/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setHistoryVideos(d.videos);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullname: name, email }),
      });
      const data = await res.json();
      if (!data.success) {
        setProfileError(data.message);
        return;
      }
      setUser(data.user);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setProfileError(p.connectErr);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 8) {
      setPwError(p.pwMinLength);
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(p.pwMismatch);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    setPwSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPwError(data.message);
        return;
      }
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 3000);
    } catch {
      setPwError(p.connectErr);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      if (!data.success) {
        setSurveyError(data.message);
        return;
      }
      setUser(data.user);
      setSurveySaved(true);
      setSurveyEditing(false);
      setTimeout(() => setSurveySaved(false), 3000);
    } catch {
      setSurveyError(p.connectErr);
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
        <p className="text-gray-400 mt-1">{p.subtitle}</p>
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
              {avatarPreview || user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    avatarPreview ??
                    (user.avatar.startsWith("/uploads")
                      ? `http://${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.avatar}`
                      : user.avatar)
                  }
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
                title={p.changeAvatarTitle}
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00E5FF] flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
              >
                {avatarUploading ? (
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-black" />
                )}
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
                  {p.joined.replace(
                    "{date}",
                    new Date(user.created_at).toLocaleDateString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    }),
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {p.points.replace("{n}", user.total_points.toLocaleString())}
                </span>
              </div>
            </div>
          </div>

          {/* ── Learning stats ──────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">
              {p.stats.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Video}
                label={p.stats.savedVideos}
                value={statsLoading ? 0 : stats.videosCount}
                color="bg-purple-500"
              />
              <StatCard
                icon={BookOpen}
                label={p.stats.savedWords}
                value={statsLoading ? 0 : stats.vocabTotal}
                color="bg-blue-500"
              />
              <StatCard
                icon={CheckCircle2}
                label={p.stats.mastered}
                value={statsLoading ? 0 : stats.vocabLearned}
                color="bg-emerald-500"
              />
              <StatCard
                icon={Flame}
                label={p.stats.streak}
                value={statsLoading ? 0 : stats.study_streak}
                color="bg-orange-500"
              />
            </div>
          </section>

          {/* ── Tiếp tục học ──────────────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-[#00E5FF]" />
              {p.continueLearning.title}
            </h2>
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
              </div>
            ) : historyVideos.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-8 text-center">
                <p className="text-gray-500 text-sm">
                  {p.continueLearning.empty}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyVideos.map((v) => {
                  const mins = Math.floor(v.progressTime / 60);
                  const secs = Math.floor(v.progressTime % 60);
                  const durMins = Math.floor(v.duration / 60);
                  const durSecs = Math.floor(v.duration % 60);
                  return (
                    <div
                      key={v._id}
                      className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#00E5FF]/30 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video">
                        {v.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              v.isLocal
                                ? `http://${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${v.thumbnail}`
                                : v.thumbnail
                            }
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                            <Video className="w-8 h-8 text-purple-400" />
                          </div>
                        )}
                        {v.isCompleted ? (
                          <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />{" "}
                            {p.continueLearning.completed}
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {v.progressPercent}%
                          </span>
                        )}
                        {/* Thin progress bar at bottom of thumbnail */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className={`h-full ${v.isCompleted ? "bg-emerald-400" : "bg-[#00E5FF]"}`}
                            style={{ width: `${v.progressPercent}%` }}
                          />
                        </div>
                      </div>
                      {/* Body */}
                      <div className="p-4 space-y-3">
                        <p className="text-white text-sm font-semibold line-clamp-2 leading-snug">
                          {v.title}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            {p.continueLearning.at.replace(
                              "{time}",
                              `${mins}:${secs.toString().padStart(2, "0")}`,
                            )}
                            {v.duration > 0 && (
                              <span className="text-gray-600">
                                {" "}
                                / {durMins}:
                                {durSecs.toString().padStart(2, "0")}
                              </span>
                            )}
                          </span>
                          <span>
                            {new Date(v.lastWatchedAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${v.isCompleted ? "bg-emerald-400" : "bg-[#00E5FF]"}`}
                            style={{ width: `${v.progressPercent}%` }}
                          />
                        </div>
                        {/* Last segment snippet */}
                        {v.progressSegment && !v.isCompleted && (
                          <p className="text-gray-600 text-[11px] italic truncate">
                            &ldquo;{v.progressSegment}&rdquo;
                          </p>
                        )}
                        <button
                          onClick={() =>
                            v.isLocal
                              ? router.push(
                                  `/dashboard/practice/local/${v._id}?title=${encodeURIComponent(v.title)}`,
                                )
                              : router.push(
                                  `/dashboard/practice/${v.youtubeId}?title=${encodeURIComponent(v.title)}`,
                                )
                          }
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            v.isCompleted
                              ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20"
                              : "bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 text-[#00E5FF] border border-[#00E5FF]/20"
                          }`}
                        >
                          <PlayCircle className="w-4 h-4" />
                          {v.isCompleted
                            ? p.continueLearning.practiceAgain
                            : p.continueLearning.continueBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Recent videos ────────────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">
              {p.recentVideos.title}
            </h2>
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
              </div>
            ) : recentVideos.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-8 text-center">
                <p className="text-gray-500 text-sm">{p.recentVideos.empty}</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
                {recentVideos.map((v) => (
                  <div
                    key={v._id}
                    className="flex items-center gap-3 px-5 py-4"
                  >
                    {v.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          v.isLocal
                            ? `http://${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${v.thumbnail}`
                            : v.thumbnail
                        }
                        alt={v.title}
                        className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {v.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(v.lastPracticed).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          v.isLocal
                            ? `/dashboard/practice/local/${v._id}?title=${encodeURIComponent(v.title)}`
                            : `/dashboard/practice/${v.youtubeId}?title=${encodeURIComponent(v.title)}`,
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-medium text-[#00E5FF] hover:text-white bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {p.recentVideos.practiceAgain}
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
              {p.editProfile.title}
            </h2>
            <form
              onSubmit={handleSaveProfile}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">
                    {p.editProfile.displayName}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition"
                      placeholder={p.editProfile.namePlaceholder}
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
                  placeholder={p.editProfile.bioPlaceholder}
                />
                <p className="text-xs text-gray-600 text-right">
                  {bio.length}/200
                </p>
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
                  {profileSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {profileSaving ? p.editProfile.saving : p.editProfile.save}
                </button>
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {p.editProfile.saved}
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
                {p.learningPrefs.title}
              </h2>
              {!surveyEditing && (
                <button
                  onClick={() => setSurveyEditing(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-[#00E5FF] hover:text-white bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 px-4 py-2 rounded-xl transition"
                >
                  <Edit3 className="w-4 h-4" />
                  {p.learningPrefs.edit}
                </button>
              )}
              {surveySaved && !surveyEditing && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> {p.editProfile.saved}
                </span>
              )}
            </div>

            {/* ── Read-only summary ── */}
            {!surveyEditing && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                {/* Age + Level */}
                <div className="flex flex-wrap gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {p.learningPrefs.age}
                    </p>
                    <p className="text-white font-medium">
                      {surveyAge || (
                        <span className="text-gray-500 italic">
                          {p.learningPrefs.notFilled}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {p.learningPrefs.level}
                    </p>
                    <p className="text-white font-medium">
                      {ENGLISH_LEVELS.find(
                        (l: { value: string }) => l.value === surveyLevel,
                      )?.label ?? (
                        <span className="text-gray-500 italic">
                          {p.learningPrefs.notSelected}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {p.learningPrefs.studyTime}
                    </p>
                    <p className="text-white font-medium">
                      {STUDY_TIMES.find(
                        (st: { value: number }) => st.value === surveyTime,
                      )?.label ?? (
                        <span className="text-gray-500 italic">
                          {p.learningPrefs.notSelected}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {p.learningPrefs.goals}
                  </p>
                  {surveyGoals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {surveyGoals.map((v) => (
                        <span
                          key={v}
                          className="px-3 py-1 rounded-full text-xs bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30"
                        >
                          {GOALS.find((g: { value: string }) => g.value === v)
                            ?.label ?? v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      {p.learningPrefs.notSelected}
                    </p>
                  )}
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {p.learningPrefs.interests}
                  </p>
                  {surveyInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {surveyInterests.map((v) => (
                        <span
                          key={v}
                          className="px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30"
                        >
                          {INTERESTS.find(
                            (ii: { value: string }) => ii.value === v,
                          )?.label ?? v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      {p.learningPrefs.notSelected}
                    </p>
                  )}
                </div>

                {/* Learning style */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {p.learningPrefs.style}
                  </p>
                  {surveyStyle.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {surveyStyle.map((v) => (
                        <span
                          key={v}
                          className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30"
                        >
                          {LEARNING_STYLES.find(
                            (s: { value: string }) => s.value === v,
                          )?.label ?? v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      {p.learningPrefs.notSelected}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Edit form ── */}
            {surveyEditing && (
              <form
                onSubmit={handleSaveSurvey}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
              >
                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400">
                    {p.learningPrefs.ageLabel}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={surveyAge}
                    onChange={(e) => setSurveyAge(e.target.value)}
                    placeholder={p.learningPrefs.agePlaceholder}
                    className="w-32 bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition"
                  />
                </div>

                {/* English level */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    {p.learningPrefs.level}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ENGLISH_LEVELS.map(
                      (lvl: { value: string; label: string; desc: string }) => (
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
                          <span className="text-xs opacity-60 mt-0.5">
                            {lvl.desc}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    {p.learningPrefs.goalsLabel}
                  </label>
                  <MultiSelect
                    options={GOALS}
                    selected={surveyGoals}
                    onChange={setSurveyGoals}
                  />
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    {p.learningPrefs.interestsLabel}
                  </label>
                  <MultiSelect
                    options={INTERESTS}
                    selected={surveyInterests}
                    onChange={setSurveyInterests}
                  />
                </div>

                {/* Learning style */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    {p.learningPrefs.styleLabel}
                  </label>
                  <MultiSelect
                    options={LEARNING_STYLES}
                    selected={surveyStyle}
                    onChange={setSurveyStyle}
                  />
                </div>

                {/* Study time */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">
                    {p.learningPrefs.studyTimeLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STUDY_TIMES.map((st: { value: number; label: string }) => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setSurveyTime(st.value)}
                        className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                          surveyTime === st.value
                            ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] font-medium"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {st.label}
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
                    {surveySaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {surveySaving
                      ? p.learningPrefs.saving
                      : p.learningPrefs.saveBtn}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSurvey}
                    disabled={surveySaving}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-60 text-white text-sm px-5 py-2.5 rounded-xl transition"
                  >
                    {p.learningPrefs.cancel}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* ── Change password ──────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00E5FF]" />
              {p.changePassword.title}
            </h2>
            <form
              onSubmit={handleChangePassword}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
            >
              {[
                {
                  label: p.changePassword.current,
                  value: currentPw,
                  setValue: setCurrentPw,
                  show: showCurrent,
                  setShow: setShowCurrent,
                },
                {
                  label: p.changePassword.newPw,
                  value: newPw,
                  setValue: setNewPw,
                  show: showNew,
                  setShow: setShowNew,
                },
                {
                  label: p.changePassword.confirm,
                  value: confirmPw,
                  setValue: setConfirmPw,
                  show: showConfirm,
                  setShow: setShowConfirm,
                },
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
                      {show ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
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
                  {pwSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {pwSaving
                    ? p.changePassword.updating
                    : p.changePassword.update}
                </button>
                {pwSaved && (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />{" "}
                    {p.changePassword.updated}
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* ── Notification preferences ─────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00E5FF]" />
              {p.notifications.title}
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
              {/* Email general notification (local only) */}
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex items-start gap-3">
                  {emailNotif ? (
                    <Bell className="w-5 h-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">
                      {p.notifications.emailLabel}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {p.notifications.emailDesc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${emailNotif ? "bg-[#00E5FF]" : "bg-white/20"}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailNotif ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Streak reminder — persisted to backend */}
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex items-start gap-3">
                  {streakReminder ? (
                    <Bell className="w-5 h-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">
                      {p.notifications.streakLabel}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {p.notifications.streakDesc}
                    </p>
                    {streakReminder && (
                      <p className="text-[#00E5FF] text-xs mt-1 flex items-center gap-1">
                        {p.notifications.streakEnabled}
                      </p>
                    )}
                    {streakReminder && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleSendTestEmail}
                          disabled={testEmailSending}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg transition disabled:opacity-60"
                        >
                          {testEmailSending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Mail className="w-3 h-3" />
                          )}
                          Gửi email test ngay
                        </button>
                        {testEmailMsg && (
                          <span
                            className={`text-xs ${testEmailMsg.startsWith("Lỗi") || testEmailMsg.startsWith("Bạn") ? "text-red-400" : "text-emerald-400"}`}
                          >
                            {testEmailMsg}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleToggleStreakReminder}
                  disabled={notifSaving}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${streakReminder ? "bg-[#00E5FF]" : "bg-white/20"}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${streakReminder ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* ── Danger zone ──────────────────────────────── */}
          <section>
            <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {p.danger.title}
            </h2>
            <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-medium">
                  {p.danger.deleteAccount}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {p.danger.deleteDesc}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 font-semibold text-sm px-5 py-2.5 rounded-xl transition whitespace-nowrap flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                {p.danger.deleteAccount}
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
                  <h3 className="text-lg font-bold text-white">
                    {p.danger.modal.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {p.danger.modal.body}
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
                    {p.danger.modal.cancel}
                  </button>
                  <button
                    disabled={deleteConfirmText !== "XOA TAI KHOAN"}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition"
                  >
                    {p.danger.modal.confirm}
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

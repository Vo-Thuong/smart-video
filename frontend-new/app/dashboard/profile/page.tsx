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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

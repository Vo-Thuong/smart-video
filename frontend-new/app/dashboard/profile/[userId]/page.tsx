"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  BookOpen,
  Flame,
  Star,
  Crown,
  Users,
  Calendar,
  PlayCircle,
} from "lucide-react";

const API = "http://localhost:5000/api";

interface PublicUser {
  _id: string;
  username: string;
  fullname: string;
  avatar?: string;
  study_streak: number;
  total_points: number;
  is_premium: boolean;
  createdAt: string;
}

interface PublicStats {
  videosCount: number;
  vocabTotal: number;
}

interface Post {
  _id: string;
  postType?: "video" | "vocab";
  caption?: string;
  title?: string;
  thumbnail?: string;
  youtubeId?: string;
  vocabWords?: { word: string; translation: string }[];
  createdAt: string;
  likes: string[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Hôm nay";
  if (d === 1) return "Hôm qua";
  if (d < 30) return `${d} ngày trước`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m} tháng trước`;
  return `${Math.floor(m / 12)} năm trước`;
}

function joinedDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Check if viewing own profile — redirect to /dashboard/profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const me = JSON.parse(raw);
        if (me._id === userId) {
          router.replace("/dashboard/profile");
        }
      }
    } catch {}
  }, [userId, router]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setStats(data.stats);
          setPosts(data.posts);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (userId) load();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#1e1235] to-[#160d28] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#1e1235] to-[#160d28] flex flex-col items-center justify-center gap-4">
        <Users className="w-16 h-16 text-white/10" />
        <p className="text-white/50 text-lg font-medium">
          Không tìm thấy người dùng
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  const avatarSrc = user.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.avatar}`
    : null;
  const initials = user.fullname
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#1e1235] to-[#160d28] p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Profile card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-6">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-800/60" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="relative">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={user.fullname}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#1e1235] shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B2FBE] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-[#1e1235] shadow-xl">
                    {initials}
                  </div>
                )}
                {user.is_premium && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                    <Crown className="w-3.5 h-3.5 text-amber-900" />
                  </span>
                )}
              </div>
            </div>

            {/* Name & username */}
            <h1 className="text-xl font-bold text-white">{user.fullname}</h1>
            <p className="text-white/40 text-sm mt-0.5">@{user.username}</p>

            {/* Joined */}
            <div className="flex items-center gap-1.5 text-white/30 text-xs mt-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tham gia {joinedDate(user.createdAt)}</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                {
                  icon: Video,
                  label: "Video",
                  value: stats?.videosCount ?? 0,
                  color: "text-cyan-400",
                },
                {
                  icon: BookOpen,
                  label: "Từ vựng",
                  value: stats?.vocabTotal ?? 0,
                  color: "text-purple-400",
                },
                {
                  icon: Flame,
                  label: "Streak",
                  value: user.study_streak,
                  color: "text-orange-400",
                },
                {
                  icon: Star,
                  label: "Điểm",
                  value: user.total_points,
                  color: "text-yellow-400",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="bg-white/5 rounded-2xl p-3 text-center border border-white/8"
                >
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                  <p className="text-white font-bold text-base">{value}</p>
                  <p className="text-white/35 text-[11px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent posts */}
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Bài đăng gần đây
          </h2>
          <span className="text-xs text-white/25">({posts.length})</span>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white/3 rounded-2xl border border-white/8">
            <PlayCircle className="w-10 h-10 text-white/10" />
            <p className="text-white/30 text-sm">Chưa có bài đăng nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => {
              const isVocab = post.postType === "vocab";
              return (
                <Link
                  key={post._id}
                  href="/dashboard/feed"
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 transition-all duration-200"
                >
                  {/* Thumbnail / vocab icon */}
                  {isVocab ? (
                    <div className="w-16 h-11 rounded-xl bg-purple-500/20 flex-shrink-0 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                  ) : post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-16 h-11 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-11 rounded-xl bg-white/8 flex-shrink-0 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white/30" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 truncate">
                      {isVocab
                        ? post.caption ||
                          `${post.vocabWords?.length ?? 0} từ vựng`
                        : post.title || post.caption || "—"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/30">
                        {timeAgo(post.createdAt)}
                      </span>
                      {!isVocab && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Video
                        </span>
                      )}
                      {isVocab && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Từ vựng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Likes */}
                  {Array.isArray(post.likes) && post.likes.length > 0 && (
                    <div className="flex items-center gap-1 text-pink-400 flex-shrink-0">
                      <span className="text-xs font-medium">
                        {post.likes.length}
                      </span>
                      <span className="text-xs">❤️</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

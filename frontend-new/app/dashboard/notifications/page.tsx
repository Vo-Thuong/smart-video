"use client";
import { useEffect, useState, useCallback } from "react";
import { Bell, UserPlus, Check, X, Heart, Users, Clock } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

const API = "http://localhost:5000/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

interface UserInfo {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
}

interface FriendRequest {
  _id: string;
  sender: UserInfo;
  createdAt: string;
}

interface PostSummary {
  _id: string;
  title?: string;
  caption?: string;
  thumbnail?: string;
  userId?: { fullname?: string; username?: string; avatar?: string };
  createdAt: string;
}

type NotifStatus = "idle" | "accepting" | "declining" | "accepted" | "declined";

function Avatar({ user, size = 44 }: { user: UserInfo; size?: number }) {
  const initials = user.fullname?.charAt(0).toUpperCase() || "?";
  const src = user.avatar?.startsWith("http")
    ? user.avatar
    : user.avatar
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.avatar}`
      : null;
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden flex-shrink-0 bg-purple-600 flex items-center justify-center text-white font-bold text-base border-2 border-white/10"
    >
      {src ? (
        <img
          src={src}
          alt={user.fullname}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function timeAgo(dateStr: string, lang: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return lang === "vi" ? "vừa xong" : "just now";
  if (m < 60) return lang === "vi" ? `${m} phút trước` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "vi" ? `${h} giờ trước` : `${h}h ago`;
  return lang === "vi"
    ? `${Math.floor(h / 24)} ngày trước`
    : `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const { t, lang } = useLang();
  const n = t.notifications;
  const f = t.friends;

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, NotifStatus>>({});
  const [filter, setFilter] = useState<
    "all" | "unread" | "liked" | "friends-posts"
  >("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<PostSummary[]>([]);
  const [friendPosts, setFriendPosts] = useState<PostSummary[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API}/friends/requests`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data: FriendRequest[] = await res.json();
      setRequests(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    // Mark all as read: update last seen timestamp
    localStorage.setItem("notifications_last_seen", Date.now().toString());
    // Dispatch event so sidebar badge updates
    window.dispatchEvent(new Event("notifications_read"));
  }, [fetchRequests]);

  // Fetch activity: liked posts + friend posts
  useEffect(() => {
    async function fetchActivity() {
      setActivityLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const [likedRes, friendsRes] = await Promise.all([
          fetch(`${API}/posts/liked`, { headers: authHeaders() }),
          fetch(`${API}/posts/friends-recent`, { headers: authHeaders() }),
        ]);
        if (likedRes.ok) {
          const data = await likedRes.json();
          if (data.success) setLikedPosts(data.posts);
        }
        if (friendsRes.ok) {
          const data = await friendsRes.json();
          if (data.success) {
            setFriendPosts(data.posts);
            localStorage.setItem(
              "feed_friends_last_seen",
              Date.now().toString(),
            );
          }
        }
      } catch {
        // silent
      } finally {
        setActivityLoading(false);
      }
    }
    fetchActivity();
  }, []);

  // Load previously read ids from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("notifications_read_ids");
      if (raw) setReadIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("notifications_read_ids", JSON.stringify([...next]));
      return next;
    });
  }

  function markAllRead() {
    const allIds = requests.map((r) => r._id);
    const next = new Set([...readIds, ...allIds]);
    setReadIds(next);
    localStorage.setItem("notifications_read_ids", JSON.stringify([...next]));
    localStorage.setItem("notifications_last_seen", Date.now().toString());
    window.dispatchEvent(new Event("notifications_read"));
  }

  async function handleAccept(requestId: string) {
    setStatuses((prev) => ({ ...prev, [requestId]: "accepting" }));
    try {
      const res = await fetch(`${API}/friends/request/${requestId}/accept`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        setStatuses((prev) => ({ ...prev, [requestId]: "accepted" }));
        markRead(requestId);
        setTimeout(() => {
          setRequests((prev) => prev.filter((r) => r._id !== requestId));
          setStatuses((prev) => {
            const s = { ...prev };
            delete s[requestId];
            return s;
          });
        }, 1200);
      }
    } catch {
      setStatuses((prev) => ({ ...prev, [requestId]: "idle" }));
    }
  }

  async function handleDecline(requestId: string) {
    setStatuses((prev) => ({ ...prev, [requestId]: "declining" }));
    try {
      const res = await fetch(`${API}/friends/request/${requestId}/decline`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        setStatuses((prev) => ({ ...prev, [requestId]: "declined" }));
        markRead(requestId);
        setTimeout(() => {
          setRequests((prev) => prev.filter((r) => r._id !== requestId));
          setStatuses((prev) => {
            const s = { ...prev };
            delete s[requestId];
            return s;
          });
        }, 1200);
      }
    } catch {
      setStatuses((prev) => ({ ...prev, [requestId]: "idle" }));
    }
  }

  const lastSeen = parseInt(
    typeof window !== "undefined"
      ? localStorage.getItem("notifications_last_seen") || "0"
      : "0",
    10,
  );

  const filteredRequests =
    filter === "unread"
      ? requests.filter(
          (r) =>
            !readIds.has(r._id) &&
            new Date(r.createdAt).getTime() > lastSeen - 86400000 * 30,
        )
      : requests;

  const unreadCount = requests.filter((r) => !readIds.has(r._id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#1e1235] to-[#160d28] p-6 md:p-10">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{n.title}</h1>
              <p className="text-sm text-white/40">{n.subtitle}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-500/10"
            >
              {n.markAllRead}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "unread", "liked", "friends-posts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab
                  ? "bg-purple-500/25 text-purple-300 border border-purple-500/30"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {tab === "liked" && <Heart className="w-3.5 h-3.5" />}
              {tab === "friends-posts" && <Users className="w-3.5 h-3.5" />}
              {tab === "all"
                ? n.all
                : tab === "unread"
                  ? n.unread
                  : tab === "liked"
                    ? n.activityLiked
                    : n.activityFriends}
              {tab === "unread" && unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list — friend requests */}
        {(filter === "all" || filter === "unread") &&
          (loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Bell className="w-12 h-12 text-white/10" />
              <p className="text-white/40 font-medium">{n.noNotifications}</p>
              <p className="text-white/25 text-sm">{n.noNotificationsHint}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredRequests.map((req) => {
                const status = statuses[req._id] || "idle";
                const isUnread = !readIds.has(req._id);

                return (
                  <div
                    key={req._id}
                    onClick={() => markRead(req._id)}
                    className={`
                    relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-default
                    ${
                      isUnread
                        ? "bg-purple-500/8 border-purple-500/20 hover:bg-purple-500/12"
                        : "bg-white/3 border-white/6 hover:bg-white/5"
                    }
                  `}
                  >
                    {/* Unread dot */}
                    {isUnread && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}

                    {/* Icon type indicator */}
                    <div className="relative">
                      <Avatar user={req.sender} size={44} />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2a1845] border border-white/10 flex items-center justify-center">
                        <UserPlus className="w-3 h-3 text-purple-400" />
                      </span>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-snug">
                        <span className="font-semibold text-white">
                          {req.sender.fullname}
                        </span>{" "}
                        <span className="text-white/60">{n.friendRequest}</span>
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {timeAgo(req.createdAt, lang)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {status === "accepted" ? (
                        <span className="text-xs text-green-400 font-medium px-3 py-1.5 rounded-lg bg-green-500/10">
                          {f.accept} ✓
                        </span>
                      ) : status === "declined" ? (
                        <span className="text-xs text-white/30 font-medium px-3 py-1.5 rounded-lg bg-white/5">
                          {f.decline}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(req._id);
                            }}
                            disabled={
                              status === "accepting" || status === "declining"
                            }
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/35 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {f.accept}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecline(req._id);
                            }}
                            disabled={
                              status === "accepting" || status === "declining"
                            }
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/80 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            {f.decline}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* ── Liked Posts (Activity) ── */}
        {filter === "liked" &&
          (activityLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : likedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Heart className="w-12 h-12 text-white/10" />
              <p className="text-white/40 font-medium">{n.activityNoLiked}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {likedPosts.map((post) => (
                <Link
                  key={post._id}
                  href="/dashboard/feed"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-pink-500/15 bg-pink-500/5 hover:bg-pink-500/10 transition-all duration-200"
                >
                  {post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-16 h-11 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-11 rounded-xl bg-purple-500/20 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 truncate">
                      {post.title || post.caption || "—"}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {timeAgo(post.createdAt, lang)}
                    </p>
                  </div>
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          ))}

        {/* ── Friend Posts (Activity) ── */}
        {filter === "friends-posts" &&
          (activityLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : friendPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Users className="w-12 h-12 text-white/10" />
              <p className="text-white/40 font-medium">{n.activityNoFriends}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {friendPosts.map((post) => (
                <Link
                  key={post._id}
                  href="/dashboard/feed"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/6 bg-white/3 hover:bg-white/5 transition-all duration-200"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {post.userId?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          post.userId.avatar.startsWith("http")
                            ? post.userId.avatar
                            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${post.userId.avatar}`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10">
                        {(post.userId?.fullname || post.userId?.username || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2a1845] border border-white/10 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-purple-400" />
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90">
                      <span className="font-semibold text-white">
                        {post.userId?.fullname || post.userId?.username}
                      </span>
                      <span className="text-white/50"> {n.activityPosted}</span>
                    </p>
                    <p className="text-xs text-white/55 truncate mt-0.5">
                      {post.title || post.caption || "—"}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {timeAgo(post.createdAt, lang)}
                    </p>
                  </div>
                  {/* Thumbnail */}
                  {post.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-14 h-10 object-cover rounded-lg flex-shrink-0 opacity-70"
                    />
                  )}
                </Link>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

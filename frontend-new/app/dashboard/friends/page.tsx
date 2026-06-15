"use client";
import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, UserCheck, UserX, Search, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import api from "@/lib/api";

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
  createdAt?: string;
}

interface FriendRequest {
  _id: string;
  sender: UserInfo;
  createdAt: string;
}

function Avatar({ user, size = 40 }: { user: UserInfo; size?: number }) {
  const initials = user.fullname?.charAt(0).toUpperCase() || "?";
  const src = user.avatar?.startsWith("http")
    ? user.avatar
    : user.avatar
      ? `http://${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.avatar}`
      : null;

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-bold text-sm border-2 border-border"
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─────────────── Suggestion Card ─────────────── */
function SuggestionCard({
  user,
  onSent,
}: {
  user: UserInfo;
  onSent: (id: string) => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const { t } = useLang();
  const f = t.friends;

  async function send() {
    setState("loading");
    try {
      const res = await fetch(`${API}/friends/request/${user._id}`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok || res.status === 409) {
        setState("sent");
        onSent(user._id);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
      <Avatar user={user} size={64} />
      <div className="text-center">
        <p className="font-semibold text-foreground text-sm">{user.fullname}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
      {user.createdAt && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} /> {f.joined} {timeAgo(user.createdAt)}
        </span>
      )}
      <button
        onClick={send}
        disabled={state !== "idle"}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
          state === "sent"
            ? "bg-green-500/10 text-green-500 cursor-default"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {state === "loading" ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : state === "sent" ? (
          <>
            <UserCheck size={15} /> {f.requestSent}
          </>
        ) : (
          <>
            <UserPlus size={15} /> {f.addFriend}
          </>
        )}
      </button>
    </div>
  );
}

/* ─────────────── Request Card ─────────────── */
function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  onAccept: (req: FriendRequest) => void;
  onDecline: (id: string) => void;
}) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const { t } = useLang();
  const f = t.friends;

  async function accept() {
    setLoading("accept");
    const res = await fetch(`${API}/friends/request/${request._id}/accept`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    if (res.ok) onAccept(request);
    setLoading(null);
  }

  async function decline() {
    setLoading("decline");
    const res = await fetch(`${API}/friends/request/${request._id}/decline`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    if (res.ok) onDecline(request._id);
    setLoading(null);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <Avatar user={request.sender} size={52} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">
          {request.sender.fullname}
        </p>
        <p className="text-xs text-muted-foreground">
          @{request.sender.username}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {timeAgo(request.createdAt)}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={accept}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all"
        >
          {loading === "accept" ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <UserCheck size={14} />
          )}
          {f.accept}
        </button>
        <button
          onClick={decline}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-red-500/10 hover:text-red-400 hover:border-red-400 text-muted-foreground rounded-xl text-sm font-semibold transition-all"
        >
          {loading === "decline" ? (
            <span className="w-3.5 h-3.5 border-2 border-muted/30 border-t-muted-foreground rounded-full animate-spin" />
          ) : (
            <UserX size={14} />
          )}
          {f.decline}
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Friend Card ─────────────── */
function FriendCard({
  user,
  onUnfriend,
}: {
  user: UserInfo;
  onUnfriend: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { t } = useLang();
  const f = t.friends;

  async function unfriend() {
    if (!confirm(f.unfriendConfirm.replace("{name}", user.fullname))) return;
    setLoading(true);
    await fetch(`${API}/friends/${user._id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    onUnfriend(user._id);
    setLoading(false);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <Avatar user={user} size={52} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{user.fullname}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
      <button
        onClick={unfriend}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-red-500/10 hover:text-red-400 hover:border-red-400 text-muted-foreground rounded-xl text-xs font-semibold transition-all"
      >
        <UserX size={13} /> {f.unfriend}
      </button>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function FriendsPage() {
  const [tab, setTab] = useState<"suggestions" | "requests" | "friends">(
    "suggestions",
  );
  const [suggestions, setSuggestions] = useState<UserInfo[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useLang();
  const f = t.friends;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, f] = await Promise.all([
        fetch(`${API}/friends/suggestions`, { headers: authHeaders() }).then(
          (x) => x.json(),
        ),
        fetch(`${API}/friends/requests`, { headers: authHeaders() }).then((x) =>
          x.json(),
        ),
        fetch(`${API}/friends/list`, { headers: authHeaders() }).then((x) =>
          x.json(),
        ),
      ]);
      setSuggestions(Array.isArray(s) ? s : []);
      setRequests(Array.isArray(r) ? r : []);
      setFriends(Array.isArray(f) ? f : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function removeSuggestion(id: string) {
    setSuggestions((prev) => prev.filter((u) => u._id !== id));
  }

  function handleAccept(req: FriendRequest) {
    setRequests((prev) => prev.filter((r) => r._id !== req._id));
    setFriends((prev) => [req.sender, ...prev]);
  }

  function handleDecline(id: string) {
    setRequests((prev) => prev.filter((r) => r._id !== id));
  }

  function handleUnfriend(id: string) {
    setFriends((prev) => prev.filter((u) => u._id !== id));
  }

  const filteredFriends = friends.filter(
    (f) =>
      f.fullname.toLowerCase().includes(search.toLowerCase()) ||
      f.username.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs = [
    {
      key: "suggestions",
      label: f.tabSuggestions,
      icon: UserPlus,
      count: suggestions.length,
    },
    {
      key: "requests",
      label: f.tabRequests,
      icon: UserCheck,
      count: requests.length,
    },
    { key: "friends", label: f.tabFriends, icon: Users, count: friends.length },
  ] as const;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          {f.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{f.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
              tab === key
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
            {count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  key === "requests"
                    ? "bg-red-500 text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <span className="w-8 h-8 border-4 border-border border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Suggestions tab */}
          {tab === "suggestions" && (
            <div>
              {suggestions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">{f.noSuggestions}</p>
                  <p className="text-sm mt-1">{f.noSuggestionsHint}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {suggestions.map((user) => (
                    <SuggestionCard
                      key={user._id}
                      user={user}
                      onSent={removeSuggestion}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests tab */}
          {tab === "requests" && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">{f.noRequests}</p>
                </div>
              ) : (
                requests.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))
              )}
            </div>
          )}

          {/* Friends tab */}
          {tab === "friends" && (
            <div>
              {friends.length > 0 && (
                <div className="relative mb-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={f.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              )}
              {filteredFriends.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">
                    {friends.length === 0 ? f.noFriends : f.noResults}
                  </p>
                  <p className="text-sm mt-1">
                    {friends.length === 0 ? f.noFriendsHint : f.noResultsHint}
                  </p>
                  {friends.length === 0 && (
                    <button
                      onClick={() => setTab("suggestions")}
                      className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {f.browseSuggestions}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFriends.map((user) => (
                    <FriendCard
                      key={user._id}
                      user={user}
                      onUnfriend={handleUnfriend}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

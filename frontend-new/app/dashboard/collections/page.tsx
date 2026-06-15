"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Video,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

interface Category {
  _id: string;
  name: string;
  color: string;
  videoCount?: number;
  vocabCount?: number;
}

const PRESET_COLORS = [
  "#00E5FF",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#3B82F6",
  "#84CC16",
  "#F97316",
  "#8B5CF6",
  "#06B6D4",
  "#A3E635",
];

export default function CollectionsPage() {
  const router = useRouter();
  const { t } = useLang();
  const p = t.collections;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createColor, setCreateColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);

  // Edit state: { id, name, color }
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    Authorization: `Bearer ${token ?? ""}`,
    "Content-Type": "application/json",
  };

  // Fetch categories + video count + vocab count per category
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/category`,
        { headers },
      ).then((r) => r.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/saved-video`,
        { headers },
      ).then((r) => r.json()),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/vocabulary?source=collection`,
        { headers },
      ).then((r) => r.json()),
    ])
      .then(([catData, videoData, vocabData]) => {
        if (!catData.success) return;
        const cats: Category[] = catData.categories;

        const videoCountMap: Record<string, number> = {};
        if (videoData.success) {
          for (const v of videoData.videos) {
            if (v.categoryId?._id) {
              videoCountMap[v.categoryId._id] =
                (videoCountMap[v.categoryId._id] || 0) + 1;
            }
          }
        }

        const vocabCountMap: Record<string, number> = {};
        if (vocabData.success) {
          for (const v of vocabData.vocabulary) {
            if (v.categoryId) {
              const id =
                typeof v.categoryId === "object"
                  ? v.categoryId._id
                  : v.categoryId;
              vocabCountMap[id] = (vocabCountMap[id] || 0) + 1;
            }
          }
        }

        cats.forEach((c) => {
          c.videoCount = videoCountMap[c._id] || 0;
          c.vocabCount = vocabCountMap[c._id] || 0;
        });
        setCategories(cats);
      })
      .catch(() => toast.error(p.loadErr))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/category`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ name: createName.trim(), color: createColor }),
        },
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      setCategories((prev) => [...prev, { ...data.category, videoCount: 0 }]);
      setCreateName("");
      setCreateColor(PRESET_COLORS[0]);
      setShowCreate(false);
      toast.success(p.created);
    } catch {
      toast.error(p.createErr);
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const startEdit = (cat: Category) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditColor("");
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/category/${id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ name: editName.trim(), color: editColor }),
        },
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      setCategories((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, name: data.category.name, color: data.category.color }
            : c,
        ),
      );
      cancelEdit();
      toast.success(p.saved);
    } catch {
      toast.error(p.saveErr);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/category/${id}`,
        {
          method: "DELETE",
          headers,
        },
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setDeleteId(null);
      toast.success(p.deleted);
    } catch {
      toast.error(p.deleteErr);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
            {p.title}
          </h1>
          <p className="text-gray-400">{p.subtitle}</p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setEditId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00BCCC] text-black text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          {p.newBtn}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-[#1C1132] border border-[#00E5FF]/30 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#00E5FF]" />
            {p.createTitle}
          </h2>
          <input
            autoFocus
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder={p.namePlaceholder}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-[#00E5FF]/50 text-sm"
          />
          <div>
            <p className="text-gray-400 text-xs mb-2">{p.chooseColor}</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCreateColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: createColor === c ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowCreate(false);
                setCreateName("");
                setCreateColor(PRESET_COLORS[0]);
              }}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
            >
              {p.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00BCCC] text-black text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {creating ? p.creating : p.create}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{p.empty}</p>
          <p className="text-sm mt-1">{p.emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-[#1C1132] border border-white/10 rounded-2xl px-5 py-4"
            >
              {editId === cat._id ? (
                /* ── Edit mode ── */
                <div className="space-y-3">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(cat._id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]/50 text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 flex-wrap flex-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: c,
                            borderColor:
                              editColor === c ? "white" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSave(cat._id)}
                        disabled={saving || !editName.trim()}
                        className="p-1.5 rounded-lg text-[#00E5FF] hover:bg-[#00E5FF]/10 disabled:opacity-50 transition-colors"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/collections/${cat._id}`)
                    }
                    className="flex items-center gap-4 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        border: `1px solid ${cat.color}40`,
                      }}
                    >
                      <FolderOpen
                        className="w-5 h-5"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{cat.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {cat.videoCount ?? 0} video
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {p.words.replace("{n}", String(cat.vocabCount ?? 0))}
                        </span>
                      </div>
                    </div>
                  </button>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title={p.editTitle}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title={p.deleteTitle}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1C1132] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-white font-semibold text-lg">
              {p.deleteModal.title}
            </h3>
            <p className="text-gray-400 text-sm">{p.deleteModal.body}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
              >
                {p.deleteModal.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {deleting ? p.deleteModal.deleting : p.deleteModal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

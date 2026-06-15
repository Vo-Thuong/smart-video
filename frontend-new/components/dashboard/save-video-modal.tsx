"use client";

import { useState, useEffect } from "react";
import { Heart, X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORY_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#059669",
  "#DC2626",
  "#D97706",
  "#DB2777",
];

interface Category {
  _id: string;
  name: string;
  color: string;
}

export interface VideoInfo {
  videoId: string;
  youtubeUrl: string;
  title: string;
  thumbnail: string;
}

interface Props {
  videoInfo: VideoInfo;
  onClose: () => void;
  onSaved: () => void;
}

export function SaveVideoModal({ videoInfo, onClose, onSaved }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/category", {
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      } as HeadersInit,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/category", {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        setSelectedCategoryId(data.category._id);
        setNewCategoryName("");
        setShowNewCategory(false);
        toast.success("Đã tạo chủ đề mới");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Lỗi khi tạo chủ đề");
    }
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để lưu video");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/saved-video", {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({
          youtubeUrl: videoInfo.youtubeUrl,
          youtubeId: videoInfo.videoId,
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          categoryId: selectedCategoryId || undefined,
          isFavorite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã lưu video thành công!");
        onSaved();
      } else {
        toast.error(data.message || "Lỗi khi lưu video");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1C1132] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Lưu video</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Thumbnail + title */}
          <div className="flex gap-3">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-28 h-16 object-cover rounded-lg flex-shrink-0 bg-[#2D1F47]"
            />
            <p className="text-white text-sm font-medium line-clamp-3">
              {videoInfo.title}
            </p>
          </div>

          {/* Favorite toggle */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center gap-2 text-sm rounded-full px-4 py-2 border transition-colors ${
              isFavorite
                ? "border-red-400 text-red-400 bg-red-400/10"
                : "border-white/20 text-gray-400 hover:border-red-400 hover:text-red-400"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Đã yêu thích" : "Thêm vào yêu thích"}
          </button>

          {/* Category */}
          <div className="space-y-2">
            <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" /> Chủ đề
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategoryId("")}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  !selectedCategoryId
                    ? "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10"
                    : "border-white/20 text-gray-400 hover:border-white/40"
                }`}
              >
                Không phân loại
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategoryId(cat._id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedCategoryId === cat._id
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={{
                    borderColor:
                      selectedCategoryId === cat._id ? cat.color : undefined,
                    backgroundColor:
                      selectedCategoryId === cat._id
                        ? `${cat.color}20`
                        : undefined,
                  }}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="px-3 py-1 rounded-full text-sm border border-dashed border-white/30 text-gray-400 hover:border-white/60 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tạo mới
              </button>
            </div>

            {showNewCategory && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Tên chủ đề..."
                  className="flex-1 bg-[#2D1F47] rounded-full px-4 py-2 text-sm text-white border border-white/10 outline-none focus:border-[#7C3AED]"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                />
                <div className="flex gap-1">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewCategoryColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newCategoryColor === c
                          ? "border-white scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateCategory}
                  className="text-[#00E5FF] hover:text-white text-sm font-medium whitespace-nowrap"
                >
                  Thêm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-full bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold"
          >
            {saving ? "Đang lưu..." : "Lưu video"}
          </Button>
        </div>
      </div>
    </div>
  );
}

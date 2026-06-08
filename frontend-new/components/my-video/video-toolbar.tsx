"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

interface Category {
  _id: string;
  name: string;
  color: string;
}

interface Props {
  categories: Category[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function VideoToolbar({ categories, activeFilter, onFilterChange, searchQuery, onSearchChange }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const mv = t.myVideo;

  const btnClass = (key: string) =>
    activeFilter === key
      ? "px-5 py-1.5 rounded-full border border-[#00E5FF] text-[#00E5FF] text-sm bg-[#00E5FF]/10 transition-colors"
      : "px-5 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-10">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex items-center bg-[#2D1F47] rounded-full px-4 h-10 w-64 border border-white/5 focus-within:border-[#00E5FF]/40 transition-colors">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={mv.searchPlaceholder}
            className="w-full bg-transparent border-none outline-none shadow-none text-white text-sm placeholder:text-gray-400 focus:ring-0"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="text-gray-500 hover:text-white ml-1 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnClass("all")} onClick={() => onFilterChange("all")}>
            {mv.filterAll}
          </button>
          <button className={btnClass("favorite")} onClick={() => onFilterChange("favorite")}>
            {mv.filterFavorite} ❤️
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onFilterChange(cat._id)}
              className={`px-5 py-1.5 rounded-full text-sm transition-colors ${
                activeFilter === cat._id ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              style={{
                border: `1px solid ${activeFilter === cat._id ? cat.color : "rgba(255,255,255,0.1)"}`,
                backgroundColor: activeFilter === cat._id ? `${cat.color}20` : undefined,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Button
        className="rounded-full bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold px-6 h-10"
        onClick={() => router.push("/dashboard")}
      >
        {mv.addNew}
      </Button>
    </div>
  );
}
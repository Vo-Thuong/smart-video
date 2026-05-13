import { Search } from "lucide-react";

export const SearchSection = () => {
  return (
    <div className="relative w-full max-w-3xl">
      <input
        type="text"
        placeholder="Paste a YouTube video URL here..."
        className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-6 pr-32 outline-none focus:ring-2 focus:ring-[#00e5ff]/50 transition-all text-white placeholder:text-white/40"
      />
      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00e5ff] text-[#1a1033] font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform">
        Start Lesson
      </button>
    </div>
  );
};

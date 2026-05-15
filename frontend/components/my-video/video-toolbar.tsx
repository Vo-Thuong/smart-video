import { Button } from "@/components/ui/button";

export function VideoToolbar() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-10">
      {/* Left Side: Search & Filters */}
      <div className="flex flex-wrap items-center gap-6">
        
        {/* Search Input */}
        <div className="flex items-center bg-[#2D1F47] rounded-full px-4 h-10 w-64 border border-white/5">
          <input 
            type="text" 
            placeholder="Search your video...." 
            className="w-full bg-transparent border-none outline-none shadow-none text-white text-sm placeholder:text-gray-400 focus:ring-0"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3">
          {/* Active State (All) */}
          <button className="px-5 py-1.5 rounded-full border border-[#00E5FF] text-[#00E5FF] text-sm bg-[#00E5FF]/10 transition-colors">
            All
          </button>
          
          {/* Inactive States */}
          <button className="px-5 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            Liked
          </button>
          <button className="px-5 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            Star mark
          </button>
        </div>
      </div>

      {/* Right Side: Add Button */}
      <Button className="rounded-full bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold px-6 h-10">
        Add new video
      </Button>
    </div>
  );
}
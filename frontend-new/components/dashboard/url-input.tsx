import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UrlInput() {
  return (
<div className="flex items-center gap-2 p-2 rounded-full border border-white/10 bg-[#1C1132]">
      
      {/* Inner input container: Lighter purple, pill shape */}
      <div className="flex-1 h-12 bg-[#2D1F47] rounded-full px-6 flex items-center">
        <input 
          type="text" 
          placeholder="Paste a YouTube video URL here..." 
          // Native input with all defaults stripped away
          className="w-full bg-transparent border-none outline-none shadow-none text-white placeholder:text-gray-400 focus:ring-0"
        />
      </div>

      {/* Button */}
      <Button className="rounded-full bg-[#00E5FF] hover:bg-[#00BCCC] text-black font-semibold px-8 h-12">
        Start Lesson
      </Button>
    </div>
  );
}
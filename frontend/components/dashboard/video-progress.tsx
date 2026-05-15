import Image from "next/image";

interface VideoProgressProps {
  title: string;
  progress: number;
  thumbnail: string;
}

export const VideoProgress = ({
  title,
  progress,
  thumbnail,
}: VideoProgressProps) => {
  return (
    <div className="flex items-center gap-3 mb-4 last:mb-0">
      <div className="w-16 h-10 relative rounded overflow-hidden shrink-0">
        <Image src={thumbnail} alt={title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-black truncate leading-tight mb-1">
          {title}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00e5ff]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            % complete: {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

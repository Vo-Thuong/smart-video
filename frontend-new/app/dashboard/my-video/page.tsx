import { VideoToolbar } from "@/components/my-video/video-toolbar";

export default function MyVideoPage() {
  // Creating a dummy array of 6 items so we can easily map out the gray placeholder boxes
  const placeholderCards = Array.from({ length: 6 });

  return (
    <div className="max-w-5xl mx-auto space-y-2">
      
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Your Video Sets
        </h1>
        <p className="text-gray-300">
          Select a video and start to practice
        </p>
      </div>

      {/* Toolbar */}
      <VideoToolbar />

      {/* Video Grid Section */}
      {/* grid-cols-3 creates the 3 columns, gap-8 adds space between them */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        
        {placeholderCards.map((_, index) => (
          <div 
            key={index} 
            // aspect-[4/5] gives it that portrait rectangular shape from your design
            className="bg-[#E5E5E5] w-full aspect-[4/5] rounded-md shadow-md"
          >
            {/* Later, you can drop your actual image/video thumbnail components in here */}
          </div>
        ))}
        
      </div>
    </div>
  );
}
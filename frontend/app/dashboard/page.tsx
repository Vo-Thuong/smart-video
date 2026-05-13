import { Sidebar } from "@/components/dashboard/sidebar";
import { SearchSection } from "@/components/dashboard/search-section";
import { StatCard } from "@/components/dashboard/stat-card";
import { VideoProgress } from "@/components/dashboard/video-progress";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#1a1033] to-[#4a3485]">
      <Sidebar />

      <main className="flex-1 p-12 text-white overflow-y-auto pt-24">
        <h1 className="text-5xl font-bold mb-4">Welcome back, Thuong!</h1>
        <p className="text-white/80 text-lg mb-12">
          Join thousands of students overcoming their lack of English skill.
        </p>

        <SearchSection />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <StatCard title="Continue" subtitle="Recent video">
            <VideoProgress
              title="Listen & Copy: American accent..."
              progress={45}
              thumbnail="/temp-v1.jpg"
            />
            <VideoProgress
              title="Listen & Copy: English with..."
              progress={5}
              thumbnail="/temp-v2.jpg"
            />
          </StatCard>

          <StatCard title="Vocabulary status" subtitle="Words need to review" />

          <StatCard title="Consistency" subtitle="Daily streak" />
        </div>
      </main>
    </div>
  );
}

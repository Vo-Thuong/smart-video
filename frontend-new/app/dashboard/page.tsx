import { DashboardHeader } from "@/components/dashboard/header";
import { UrlInput } from "@/components/dashboard/url-input";
import { VideoRecommendations } from "@/components/dashboard/video-recommendations";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <DashboardHeader />
      <UrlInput />
      <VideoRecommendations />
    </div>
  );
}
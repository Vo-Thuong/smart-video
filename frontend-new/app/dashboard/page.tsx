import { DashboardHeader } from "@/components/dashboard/header";
import { UrlInput } from "@/components/dashboard/url-input";
import { ContinueCard } from "@/components/dashboard/continue-card";
// Import the other cards once you make them:
// import { VocabularyCard } from "@/components/dashboard/vocabulary-card";
// import { ConsistencyCard } from "@/components/dashboard/consistency-card";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <DashboardHeader />
      <UrlInput />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContinueCard />
        
        {/* Replace these divs with your actual components later */}
        <div className="bg-[#E5E5E5] rounded-xl shadow-lg h-80 p-6">
           <h3 className="text-black text-lg font-semibold">Vocabulary status</h3>
        </div>
        <div className="bg-[#E5E5E5] rounded-xl shadow-lg h-80 p-6">
           <h3 className="text-black text-lg font-semibold">Consistency</h3>
        </div>
      </div>
    </div>
  );
}
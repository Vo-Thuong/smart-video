import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#2D1B4E]">
      {/* Shared Sidebar only for dashboard routes */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#3E2465] to-[#1C1642] p-10">
        {children}
      </main>
    </div>
  );
}
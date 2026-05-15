import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#351F54] text-white flex flex-col border-r border-white/10 h-full">
      <div className="p-6">
        {/* Logo Placeholder */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gray-400 rounded-md"></div>
          <span className="font-bold text-xl tracking-wider">EasyBilly</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 text-[#00E5FF] font-semibold">
            <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
            Home Page
          </Link>
          <Link href="/dashboard/my-video" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
            <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
            My Video
          </Link>
          <Link href="/dashboard/vocabulary" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
            <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
            Vocabulary
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
            <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
            Profile
          </Link>
        </nav>
      </div>

      {/* Logout at bottom */}
      <div className="mt-auto p-6">
        <Link href="/auth/signin" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
          <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
          Logout
        </Link>
      </div>
    </aside>
  );
}
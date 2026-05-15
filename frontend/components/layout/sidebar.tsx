<<<<<<< HEAD
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  // This hook gets the current active URL path
  const pathname = usePathname();

  // Putting links in an array makes it much easier to map over them and check the active state
  const navLinks = [
    { name: "Home Page", href: "/dashboard" },
    { name: "My Video", href: "/dashboard/my-video" },
    { name: "Vocabulary", href: "/dashboard/vocabulary" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

=======
import Link from "next/link";

export function Sidebar() {
>>>>>>> 6e2ae1b (dashboard page create)
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
<<<<<<< HEAD
          {navLinks.map((link) => {
            // Check if the current URL matches the link's destination
            const isActive = pathname === link.href;
            
            return (
              <Link 
                key={link.name}
                href={link.href} 
                className={`flex items-center gap-3 font-semibold transition-colors ${
                  isActive ? "text-[#00E5FF]" : "text-gray-300 hover:text-white"
                }`}
              >
                {/* You can also conditionally style the gray box here later if you replace it with an icon */}
                <div className="w-5 h-5 bg-gray-400 rounded-sm opacity-80"></div>
                {link.name}
              </Link>
            );
          })}
=======
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
>>>>>>> 6e2ae1b (dashboard page create)
        </nav>
      </div>

      {/* Logout at bottom */}
      <div className="mt-auto p-6">
<<<<<<< HEAD
        <Link href="/auth/signin" className="flex items-center gap-3 text-gray-300 hover:text-white font-semibold transition-colors">
          <div className="w-5 h-5 bg-gray-400 rounded-sm opacity-80"></div>
=======
        <Link href="/auth/signin" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
          <div className="w-5 h-5 bg-gray-400 rounded-sm"></div>
>>>>>>> 6e2ae1b (dashboard page create)
          Logout
        </Link>
      </div>
    </aside>
  );
}
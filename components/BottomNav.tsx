"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Baby, Activity, CheckSquare, Calendar, Users, BookOpen } from "lucide-react";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/baby", label: "Bébé", icon: Baby },
  { href: "/tracking", label: "Suivi", icon: Activity },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/checklist", label: "Ma liste", icon: CheckSquare },
  { href: "/duo", label: "Duo", icon: Users },
  { href: "/conseils", label: "Conseils", icon: BookOpen },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-pink-100 bottom-nav-safe">
      <div
        className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-400 hover:text-pink-400"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "fill-pink-200" : ""}`}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Baby, Activity, Calendar, MoreHorizontal } from "lucide-react";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/baby", label: "Bébé", icon: Baby },
  { href: "/tracking", label: "Suivi", icon: Activity },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/plus", label: "Plus", icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-pink-100 bottom-nav-safe dark:bg-gray-900/90 dark:border-gray-800">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                  : "text-gray-400 hover:text-pink-400"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "fill-pink-200 dark:fill-pink-800" : ""}`}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

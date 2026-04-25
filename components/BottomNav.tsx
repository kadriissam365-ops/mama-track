"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Baby, Calendar, MoreHorizontal } from "lucide-react";
import { m as motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

const navItems = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/tracking", labelKey: "nav.tracking", icon: Activity },
  { href: "/baby", labelKey: "nav.baby", icon: Baby },
  { href: "/agenda", labelKey: "nav.agenda", icon: Calendar },
  { href: "/plus", labelKey: "nav.more", icon: MoreHorizontal },
];

const plusPaths = [
  "/journal", "/checklist", "/contractions", "/timeline", "/bump",
  "/prenoms", "/naissance", "/achats", "/alimentation", "/medicaments",
  "/respiration", "/urgences", "/duo", "/communaute", "/conseils", "/settings",
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/plus") {
      return pathname === "/plus" || plusPaths.some((p) => pathname.startsWith(p));
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-pink-100 dark:border-pink-900/80 bottom-nav-safe dark:bg-gray-900/95 dark:border-gray-800">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[60px] ${
                active
                  ? "text-pink-600 dark:text-pink-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-pink-400 dark:hover:text-pink-400"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-gradient-to-b from-pink-100 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/20 rounded-2xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`relative w-5 h-5 ${active ? "fill-pink-200 dark:fill-pink-800" : ""}`}
              />
              <span className={`relative text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

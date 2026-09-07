"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Baby, Calendar, MoreHorizontal, Sparkles } from "lucide-react";
import { m as motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

const navItems = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/tracking", labelKey: "nav.tracking", icon: Activity },
  { href: "/coach", labelKey: "nav.coach", icon: Sparkles },
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
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bottom-nav-safe"
      aria-label="Navigation principale"
    >
      <div className="max-w-lg mx-auto px-3 pb-2 pt-1.5">
        <div className="relative rounded-full border border-pink-100/80 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg shadow-pink-300/25 dark:shadow-black/40">
          <ul className="relative flex items-stretch justify-between px-1.5 py-1.5">
            {navItems.map(({ href, labelKey, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href} className="relative flex-1">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative z-10 flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] transition-colors ${
                      active
                        ? "text-pink-600 dark:text-pink-300 font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-300 font-medium"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="bottomNavIndicator"
                        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-pink-100 to-purple-50 dark:from-pink-900/40 dark:to-purple-900/30"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon
                      className={`w-[19px] h-[19px] ${active ? "fill-pink-200 dark:fill-pink-800" : ""}`}
                      strokeWidth={active ? 2.3 : 1.9}
                    />
                    <span className="leading-none tracking-tight">{t(labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

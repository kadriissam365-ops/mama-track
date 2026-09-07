"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getCurrentWeek, getDaysRemaining } from "@/lib/pregnancy-data";
import { Heart, LogOut, Settings } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ExportPDF = dynamic(() => import("./ExportPDF"), { ssr: false });

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { dueDate } = useStore();
  const { user, signOut, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const week = dueDate ? getCurrentWeek(new Date(dueDate)) : null;
  const days = dueDate ? getDaysRemaining(new Date(dueDate)) : null;

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth') || pathname === '/onboarding') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const handleSettings = () => {
    setShowMenu(false);
    router.push('/settings');
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-pink-100 dark:border-pink-900/30 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-300" />
          <span className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-lg">MamaTrack</span>
        </div>

        <div className="flex items-center gap-3">
          {week !== null && days !== null ? (
            <>
              {/* Repère semaine + compte à rebours : visible aussi sur mobile,
                  c'est l'information la plus consultée de l'app. */}
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 px-3 py-1 text-xs font-semibold text-pink-700 dark:text-pink-200"
                aria-label={`Semaine ${week} d'aménorrhée, ${days} jours restants`}
              >
                <span>SA {week}</span>
                <span aria-hidden className="text-pink-300 dark:text-pink-700">·</span>
                <span className="text-purple-700 dark:text-purple-200">J-{days}</span>
              </span>
              <div className="hidden sm:block">
                <ExportPDF />
              </div>
            </>
          ) : null}

          {/* User Menu */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menu du compte"
                aria-expanded={showMenu}
                aria-haspopup="menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-sm font-semibold text-white transition-all hover:from-pink-500 hover:to-purple-500"
              >
                {userInitial}
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-pink-100 dark:border-pink-900/30 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Connectée</p>
                      </div>

                      {/* Mobile-only: Export PDF */}
                      <div className="px-3 py-2 sm:hidden">
                        <ExportPDF />
                      </div>

                      <div className="py-1">
                        <button
                          role="menuitem"
                          onClick={handleSettings}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </button>
                        <button
                          role="menuitem"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

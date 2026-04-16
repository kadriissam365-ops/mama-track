"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getCurrentWeek, getDaysRemaining } from "@/lib/pregnancy-data";
import { Heart, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-pink-100 dark:border-pink-900/30 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-300" />
          <span className="font-semibold text-[#3d2b2b] dark:text-gray-100 text-lg">MamaTrack</span>
        </div>

        <div className="flex items-center gap-3">
          {week !== null && days !== null ? (
            <>
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full hidden sm:inline-flex">
                SA {week}
              </span>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full hidden sm:inline-flex">
                J-{days}
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
                className="flex items-center gap-1.5 bg-gradient-to-br from-pink-400 to-purple-400 text-white w-8 h-8 rounded-full justify-center font-semibold text-sm hover:from-pink-500 hover:to-purple-500 transition-all"
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
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-pink-100 dark:border-pink-900/30 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Connecté(e)</p>
                      </div>

                      {/* Mobile-only: Export PDF */}
                      <div className="px-3 py-2 sm:hidden">
                        <ExportPDF />
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleSettings}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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

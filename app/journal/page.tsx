"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, BookOpen, Images, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getBumpPhotos, getJournalNotes } from "@/lib/supabase-api";
import { useStore } from "@/lib/store";
import { getCurrentWeek } from "@/lib/pregnancy-data";

export default function JournalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useStore();
  const [photoCount, setPhotoCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  const dueDate = store.dueDate ? new Date(store.dueDate) : null;
  const currentWeek = dueDate ? getCurrentWeek(dueDate) : 20;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [photos, notes] = await Promise.all([
        getBumpPhotos(user.id),
        getJournalNotes(user.id),
      ]);
      setPhotoCount(photos.length);
      setNoteCount(notes.length);
    })();
  }, [user]);

  const cards = [
    {
      href: "/journal/photos",
      icon: Camera,
      emoji: "📸",
      title: "Photos ventre",
      subtitle: "Bump Diary",
      stat: `${photoCount} photo${photoCount !== 1 ? "s" : ""} capturée${photoCount !== 1 ? "s" : ""}`,
      color: "from-rose-100 to-pink-50",
      border: "border-rose-200",
      iconColor: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/300",
    },
    {
      href: "/journal/notes",
      icon: BookOpen,
      emoji: "📝",
      title: "Journal texte",
      subtitle: "Notes & humeur",
      stat: `${noteCount} note${noteCount !== 1 ? "s" : ""}`,
      color: "from-amber-100 to-yellow-50",
      border: "border-amber-200",
      iconColor: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/300",
    },
    {
      href: "/journal/galerie",
      icon: Images,
      emoji: "🖼️",
      title: "Galerie",
      subtitle: "Rétrospective",
      stat: `Semaine ${currentWeek}`,
      color: "from-violet-100 to-purple-50",
      border: "border-violet-200",
      iconColor: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/300",
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">Journal 📖</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tes souvenirs précieux de grossesse</p>
      </motion.div>

      {/* Hero polaroid preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 relative"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-pink-100 dark:border-pink-900/30 text-center">
          <div className="text-5xl mb-3">🤰</div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">Semaine {currentWeek}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Ta grossesse en images et en mots</p>
          <div className="flex justify-center gap-3 mt-4">
            <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full px-3 py-1">
              📸 {photoCount} photo{photoCount !== 1 ? "s" : ""}
            </span>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full px-3 py-1">
              📝 {noteCount} note{noteCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="space-y-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            onClick={() => router.push(card.href)}
            className={`w-full text-left rounded-3xl p-5 bg-gradient-to-br ${card.color} border ${card.border} shadow-sm hover:shadow-md transition-all active:scale-98`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bg} bg-opacity-20 flex items-center justify-center`}>
                  <span className="text-2xl">{card.emoji}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{card.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: "inherit" }}>
                    <span className={card.iconColor}>{card.stat}</span>
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

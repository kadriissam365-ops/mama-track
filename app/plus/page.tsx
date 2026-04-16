"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  Users,
  MessageCircle,
  BookOpen,
  Camera,
  Timer,
  Heart,
  Baby,
  ShoppingBag,
  Salad,
  Pill,
  Wind,
  AlertTriangle,
  Clock,
  ImageIcon,
  Settings,
} from "lucide-react";

const sections = [
  {
    title: "Suivi & Outils",
    items: [
      { href: "/agenda", label: "Agenda", icon: Calendar, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
      { href: "/checklist", label: "Ma liste", icon: CheckSquare, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
      { href: "/contractions", label: "Contractions", icon: Timer, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
      { href: "/journal", label: "Journal", icon: Camera, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
      { href: "/timeline", label: "Timeline", icon: Clock, color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
      { href: "/bump", label: "Bump diary", icon: ImageIcon, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
    ],
  },
  {
    title: "Préparer l'arrivée",
    items: [
      { href: "/prenoms", label: "Prénoms", icon: Heart, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
      { href: "/naissance", label: "Projet naissance", icon: Baby, color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
      { href: "/achats", label: "Liste achats", icon: ShoppingBag, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    ],
  },
  {
    title: "Santé & Bien-être",
    items: [
      { href: "/alimentation", label: "Alimentation", icon: Salad, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
      { href: "/medicaments", label: "Médicaments", icon: Pill, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
      { href: "/respiration", label: "Respiration", icon: Wind, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
      { href: "/urgences", label: "Urgences", icon: AlertTriangle, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 dark:bg-red-900/30 dark:text-red-400" },
    ],
  },
  {
    title: "Communauté & Conseils",
    items: [
      { href: "/duo", label: "Mode duo", icon: Users, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
      { href: "/communaute", label: "Communauté", icon: MessageCircle, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
      { href: "/conseils", label: "Guides", icon: BookOpen, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { href: "/settings", label: "Paramètres", icon: Settings, color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-400" },
    ],
  },
];

export default function PlusPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">Plus</h1>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.06 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
            {section.title}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {section.items.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-pink-900/30/60 dark:border-gray-700 hover:border-pink-200 dark:border-pink-800/30 dark:hover:border-pink-800 hover:shadow-sm transition-all duration-200 active:scale-95"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-[#3d2b2b] dark:text-gray-200 text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

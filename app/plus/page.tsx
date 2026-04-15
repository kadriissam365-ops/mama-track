"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
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
      { href: "/checklist", label: "Ma liste", icon: CheckSquare, color: "bg-pink-100 text-pink-600" },
      { href: "/contractions", label: "Contractions", icon: Timer, color: "bg-purple-100 text-purple-600" },
      { href: "/journal", label: "Journal", icon: Camera, color: "bg-violet-100 text-violet-600" },
      { href: "/timeline", label: "Timeline", icon: Clock, color: "bg-indigo-100 text-indigo-600" },
      { href: "/bump", label: "Bump diary", icon: ImageIcon, color: "bg-rose-100 text-rose-600" },
    ],
  },
  {
    title: "Préparer l'arrivée",
    items: [
      { href: "/prenoms", label: "Prénoms", icon: Heart, color: "bg-yellow-100 text-yellow-600" },
      { href: "/naissance", label: "Projet naissance", icon: Baby, color: "bg-teal-100 text-teal-600" },
      { href: "/achats", label: "Liste achats", icon: ShoppingBag, color: "bg-orange-100 text-orange-600" },
    ],
  },
  {
    title: "Santé & Bien-être",
    items: [
      { href: "/alimentation", label: "Alimentation", icon: Salad, color: "bg-green-100 text-green-600" },
      { href: "/medicaments", label: "Médicaments", icon: Pill, color: "bg-blue-100 text-blue-600" },
      { href: "/respiration", label: "Respiration", icon: Wind, color: "bg-cyan-100 text-cyan-600" },
      { href: "/urgences", label: "Urgences", icon: AlertTriangle, color: "bg-red-100 text-red-600" },
    ],
  },
  {
    title: "Communauté & Conseils",
    items: [
      { href: "/duo", label: "Mode duo", icon: Users, color: "bg-pink-100 text-pink-600" },
      { href: "/communaute", label: "Communauté", icon: MessageCircle, color: "bg-purple-100 text-purple-600" },
      { href: "/conseils", label: "Guides & Conseils", icon: BookOpen, color: "bg-emerald-100 text-emerald-600" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { href: "/settings", label: "Paramètres", icon: Settings, color: "bg-gray-100 text-gray-600" },
    ],
  },
];

export default function PlusPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#3d2b2b] dark:text-gray-100">Plus</h1>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }}
          className="space-y-2"
        >
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            {section.title}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-pink-100 dark:border-gray-700 overflow-hidden divide-y divide-pink-50 dark:divide-gray-700">
            {section.items.map(({ href, label, icon: Icon, color }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-pink-50/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-medium text-[#3d2b2b] dark:text-gray-200">{label}</span>
                <span className="ml-auto text-gray-300 text-lg">›</span>
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

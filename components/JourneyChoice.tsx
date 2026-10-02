"use client";
import Link from "next/link";
import { Baby, Heart, ArrowRight, BookHeart } from "lucide-react";

export default function JourneyChoice({ onPregnancy }: { onPregnancy: () => void }) {
  const card = "flex w-full items-center gap-4 rounded-3xl border border-pink-100 bg-white p-5 text-left shadow-sm transition hover:border-pink-300 dark:border-pink-900/40 dark:bg-gray-900";
  return <main className="mx-auto max-w-xl px-5 py-12">
    <div className="mb-8"><p className="mb-2 text-sm font-semibold text-pink-600">Bienvenue dans MamaTrack</p><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chaque famille a son point de départ.</h1><p className="mt-3 text-gray-600 dark:text-gray-300">Choisis ton étape. Tu pourras passer de la grossesse au carnet de ton enfant à tout moment.</p></div>
    <div className="space-y-4">
      <button className={card} onClick={onPregnancy}><Heart className="h-9 w-9 shrink-0 text-pink-500" /><span className="flex-1"><strong className="block text-lg">Je prépare une naissance</strong><span className="text-sm text-gray-500">Configurer mon suivi de grossesse</span></span><ArrowRight className="h-5 w-5" /></button>
      <Link className={card} href="/enfant/naissance"><Baby className="h-9 w-9 shrink-0 text-purple-500" /><span className="flex-1"><strong className="block text-lg">Mon bébé est déjà né</strong><span className="text-sm text-gray-500">Créer son carnet, de la naissance à 3 ans</span></span><ArrowRight className="h-5 w-5" /></Link>
      <Link className={card} href="/enfant/import"><BookHeart className="h-9 w-9 shrink-0 text-pink-400" /><span className="flex-1"><strong className="block text-lg">J’utilise déjà BabyTrack</strong><span className="text-sm text-gray-500">Retrouver mes enfants et mes suivis</span></span><ArrowRight className="h-5 w-5" /></Link>
    </div>
  </main>;
}

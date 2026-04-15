"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Baby,
  Activity,
  Calendar,
  Users,
  Camera,
  Timer,
  BookOpen,
  Shield,
  Smartphone,
  Star,
} from "lucide-react";

const features = [
  { icon: Baby, title: "Suivi semaine par semaine", desc: "Développement bébé, taille, poids et conseils personnalisés" },
  { icon: Activity, title: "10 trackers de santé", desc: "Poids, eau, symptômes, humeur, tension, sommeil et plus" },
  { icon: Timer, title: "Chrono contractions", desc: "Minuteur précis avec historique et fréquence" },
  { icon: Users, title: "Mode duo", desc: "Partagez l'aventure avec votre partenaire en temps réel" },
  { icon: Camera, title: "Journal photo", desc: "Bump diary et galerie pour capturer chaque moment" },
  { icon: Calendar, title: "Agenda médical", desc: "Tous vos rendez-vous au même endroit, avec rappels" },
  { icon: Heart, title: "250+ prénoms", desc: "Explorez, filtrez et sauvegardez vos prénoms favoris" },
  { icon: BookOpen, title: "Guides complets", desc: "Alimentation, sport, FAQ et conseils de pros" },
];

const differentiators = [
  { icon: Shield, title: "100% gratuit", desc: "Pas de version premium cachée, tout est accessible" },
  { icon: Smartphone, title: "Pas besoin de télécharger", desc: "PWA : ouvrez dans votre navigateur, ajoutez à l'écran d'accueil" },
  { icon: Star, title: "Mode FIV/PMA", desc: "La seule app qui prend en compte les parcours de PMA" },
];

const testimonials = [
  { name: "Sarah M.", week: "32 SA", text: "Je cherchais une app gratuite et complète. MamaTrack a tout ce qu'il faut, et le mode duo est génial !" },
  { name: "Léa D.", week: "28 SA", text: "Le suivi semaine par semaine est top. J'adore les comparaisons fruits et les conseils personnalisés." },
  { name: "Amina K.", week: "Accouchée", text: "Le projet naissance en PDF m'a sauvée à la maternité. Merci MamaTrack !" },
];

const faqItems = [
  { q: "MamaTrack est-il vraiment gratuit ?", a: "Oui, 100% gratuit sans pub ni abonnement caché. Toutes les fonctionnalités sont accessibles." },
  { q: "Dois-je télécharger l'app ?", a: "Non ! MamaTrack est une PWA. Ouvrez mamatrack.fr dans votre navigateur et ajoutez-le à votre écran d'accueil." },
  { q: "Mes données sont-elles sécurisées ?", a: "Vos données sont chiffrées et stockées de façon sécurisée. Nous ne vendons aucune donnée personnelle." },
  { q: "Le mode duo, c'est quoi ?", a: "Votre partenaire peut suivre votre grossesse en temps réel : symptômes, rendez-vous, évolution du bébé." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* Hero */}
      <section className="px-4 pt-12 pb-16 text-center max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-[2rem] shadow-xl mb-6"
        >
          <Heart className="w-12 h-12 text-white fill-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-[#3d2b2b] mb-3"
        >
          MamaTrack
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-600 mb-2"
        >
          Votre compagnon de grossesse
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-gray-500 mb-8 max-w-xs mx-auto"
        >
          Suivi complet, gratuit et sans pub. Du premier jour jusqu'à la naissance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 max-w-xs mx-auto"
        >
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-3.5 px-8 rounded-2xl hover:from-pink-500 hover:to-pink-600 transition-all shadow-lg shadow-pink-200 text-center"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/auth/login"
            className="text-pink-500 font-medium py-2 hover:text-pink-600 transition-colors text-center"
          >
            J'ai déjà un compte
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-[#3d2b2b] text-center mb-8">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm"
            >
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-sm font-semibold text-[#3d2b2b] mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="px-4 py-12 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-[#3d2b2b] text-center mb-8">
          Pourquoi MamaTrack ?
        </h2>
        <div className="space-y-3">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <d.icon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#3d2b2b] mb-0.5">{d.title}</h3>
                <p className="text-xs text-gray-500">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="px-4 py-8 max-w-lg mx-auto">
        <div className="flex justify-center gap-8">
          {[
            { value: "10+", label: "Trackers" },
            { value: "250+", label: "Prénoms" },
            { value: "40", label: "Semaines couvertes" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-pink-500">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-12 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-[#3d2b2b] text-center mb-8">
          Ce qu&apos;elles en disent
        </h2>
        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3d2b2b]">{t.name}</p>
                  <p className="text-[10px] text-pink-400">{t.week}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-12 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-[#3d2b2b] text-center mb-8">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm group"
            >
              <summary className="px-4 py-3.5 text-sm font-semibold text-[#3d2b2b] cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-pink-300 group-open:rotate-180 transition-transform text-lg">▾</span>
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 pb-20 max-w-lg mx-auto text-center">
        <div className="bg-gradient-to-br from-pink-100 via-purple-50 to-mint-50 rounded-3xl p-8 border border-pink-100" style={{ background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #d1fae5 100%)" }}>
          <p className="text-3xl mb-3">🤰</p>
          <h2 className="text-xl font-bold text-[#3d2b2b] mb-2">
            Prête à commencer ?
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Rejoignez les mamans qui suivent leur grossesse avec MamaTrack
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold py-3 px-8 rounded-2xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg"
          >
            Créer mon compte
          </Link>
        </div>

        <footer className="mt-12 space-y-3">
          <p className="text-xs text-gray-400">
            MamaTrack — Fait avec amour pour toutes les mamans
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>100% gratuit</span>
            <span>·</span>
            <span>Sans pub</span>
            <span>·</span>
            <span>Données sécurisées</span>
          </div>
        </footer>
      </section>
    </div>
  );
}

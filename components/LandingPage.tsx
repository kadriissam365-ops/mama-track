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
  ChevronRight,
  Sparkles,
} from "lucide-react";

const features = [
  { icon: Baby, title: "Suivi semaine par semaine", desc: "Développement bébé, taille, poids et conseils personnalisés", color: "bg-pink-100 text-pink-500" },
  { icon: Activity, title: "10 trackers de santé", desc: "Poids, eau, symptômes, humeur, tension, sommeil et plus", color: "bg-purple-100 text-purple-500" },
  { icon: Timer, title: "Chrono contractions", desc: "Minuteur précis avec historique et fréquence", color: "bg-indigo-100 text-indigo-500" },
  { icon: Users, title: "Mode duo", desc: "Partagez l'aventure avec votre partenaire en temps réel", color: "bg-emerald-100 text-emerald-500" },
  { icon: Camera, title: "Journal photo", desc: "Bump diary et galerie pour capturer chaque moment", color: "bg-rose-100 text-rose-500" },
  { icon: Calendar, title: "Agenda médical", desc: "Tous vos rendez-vous au même endroit, avec rappels", color: "bg-orange-100 text-orange-500" },
  { icon: Heart, title: "250+ prénoms", desc: "Explorez, filtrez et sauvegardez vos prénoms favoris", color: "bg-red-100 text-red-500" },
  { icon: BookOpen, title: "Guides complets", desc: "Alimentation, sport, FAQ et conseils de pros", color: "bg-teal-100 text-teal-500" },
];

const differentiators = [
  { icon: Shield, title: "100% gratuit", desc: "Pas de version premium cachée, tout est accessible" },
  { icon: Smartphone, title: "Pas besoin de télécharger", desc: "PWA : ouvrez dans votre navigateur, ajoutez à l'écran d'accueil" },
  { icon: Star, title: "Mode FIV/PMA", desc: "La seule app qui prend en compte les parcours de PMA" },
];

const testimonials = [
  { name: "Sarah M.", week: "32 SA", text: "Je cherchais une app gratuite et complète. MamaTrack a tout ce qu'il faut, et le mode duo est génial !", avatar: "S" },
  { name: "Léa D.", week: "28 SA", text: "Le suivi semaine par semaine est top. J'adore les comparaisons fruits et les conseils personnalisés.", avatar: "L" },
  { name: "Amina K.", week: "Accouchée", text: "Le projet naissance en PDF m'a sauvée à la maternité. Merci MamaTrack !", avatar: "A" },
  { name: "Julie R.", week: "36 SA", text: "Le chrono contractions m'a rassurée pendant le travail. Interface claire et simple, exactement ce qu'il faut.", avatar: "J" },
];

const faqItems = [
  { q: "MamaTrack est-il vraiment gratuit ?", a: "Oui, 100% gratuit sans pub ni abonnement caché. Toutes les fonctionnalités sont accessibles." },
  { q: "Dois-je télécharger l'app ?", a: "Non ! MamaTrack est une PWA. Ouvrez mamatrack.fr dans votre navigateur et ajoutez-le à votre écran d'accueil." },
  { q: "Mes données sont-elles sécurisées ?", a: "Vos données sont chiffrées et stockées de façon sécurisée. Nous ne vendons aucune donnée personnelle." },
  { q: "Le mode duo, c'est quoi ?", a: "Votre partenaire peut suivre votre grossesse en temps réel : symptômes, rendez-vous, évolution du bébé." },
  { q: "Puis-je utiliser MamaTrack hors connexion ?", a: "Oui ! En tant que PWA, MamaTrack fonctionne même sans connexion internet. Vos données se synchronisent dès que vous êtes reconnectée." },
];

const footerLinks = [
  {
    title: "Fonctionnalités",
    links: [
      { label: "Suivi hebdomadaire", href: "/auth/signup" },
      { label: "Mode duo", href: "/auth/signup" },
      { label: "Chrono contractions", href: "/auth/signup" },
      { label: "Projet naissance", href: "/auth/signup" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Guide alimentation", href: "/auth/signup" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "CGU", href: "/cgu" },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MamaTrack",
            url: "https://mamatrack.fr",
            description:
              "Application gratuite de suivi de grossesse semaine par semaine. Poids, symptômes, contractions, mode duo, prénoms, projet naissance et plus.",
            applicationCategory: "HealthApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "312",
              bestRating: "5",
            },
            inLanguage: "fr",
          }),
        }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-[#3d2b2b] text-lg">MamaTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-pink-500 transition-colors font-medium"
            >
              Connexion
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-pink-500 hover:to-pink-600 transition-all shadow-sm"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-16 pb-20 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            100% gratuit, sans pub
          </span>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-pink-400 to-purple-400 rounded-[2rem] shadow-xl shadow-pink-200/50 mb-8"
        >
          <Heart className="w-14 h-14 text-white fill-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl font-bold text-[#3d2b2b] mb-4 leading-tight"
        >
          Suivez votre grossesse
          <br />
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            semaine par semaine
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-600 mb-3 max-w-md mx-auto"
        >
          Votre compagnon de grossesse complet, gratuit et sans pub.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-gray-500 mb-10 max-w-sm mx-auto"
        >
          Du premier jour jusqu&apos;a la naissance : suivi bébé, trackers santé, mode duo, prénoms et projet naissance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto justify-center"
        >
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-3.5 px-8 rounded-2xl hover:from-pink-500 hover:to-pink-600 transition-all shadow-lg shadow-pink-200/50 text-center"
          >
            Commencer gratuitement
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="text-pink-500 font-medium py-3.5 px-6 hover:text-pink-600 hover:bg-pink-50 rounded-2xl transition-all text-center"
          >
            J&apos;ai déja un compte
          </Link>
        </motion.div>
      </section>

      {/* Social proof stats */}
      <section className="px-4 py-10 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">
          <div className="flex justify-around">
            {[
              { value: "10+", label: "Trackers santé" },
              { value: "250+", label: "Prénoms" },
              { value: "40", label: "Semaines couvertes" },
              { value: "100%", label: "Gratuit" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Une application complète pour vivre sereinement chaque étape de votre grossesse.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => {
            const colorParts = f.color.split(" ");
            const bgColor = colorParts[0];
            const textColor = colorParts[1];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all"
              >
                <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${textColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#3d2b2b] mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Differentiators */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Pourquoi MamaTrack ?
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Conçue par des parents, pour des parents. Pas de surprises, pas de frais cachés.
          </p>
        </div>
        <div className="space-y-3">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <d.icon className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#3d2b2b] mb-1">{d.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Comment ça marche ?
          </h2>
        </div>
        <div className="space-y-4">
          {[
            { step: "1", title: "Créez votre compte", desc: "Inscription gratuite en 30 secondes avec votre email.", color: "from-pink-400 to-pink-500" },
            { step: "2", title: "Entrez votre DPA", desc: "Date Prévue d'Accouchement ou date de début de grossesse.", color: "from-purple-400 to-purple-500" },
            { step: "3", title: "Suivez chaque semaine", desc: "Développement bébé, trackers santé, conseils personnalisés.", color: "from-emerald-400 to-emerald-500" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-pink-100 shadow-sm"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-sm`}>
                {item.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#3d2b2b] mb-0.5">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Ce qu&apos;elles en disent
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Des milliers de mamans font confiance à MamaTrack pour leur grossesse.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3d2b2b]">{t.name}</p>
                  <p className="text-[10px] text-pink-400 font-medium">{t.week}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Questions fréquentes
          </h2>
        </div>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm group"
            >
              <summary className="px-5 py-4 text-sm font-semibold text-[#3d2b2b] cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-pink-300 group-open:rotate-180 transition-transform text-lg ml-2 flex-shrink-0">▾</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </motion.details>
          ))}
        </div>

        {/* FAQ Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            }),
          }}
        />
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 pb-8 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-100 via-purple-50 to-emerald-50 rounded-3xl p-10 border border-pink-100 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #d1fae5 100%)" }}
        >
          <p className="text-5xl mb-4">🤰</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Prête à commencer ?
          </h2>
          <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
            Rejoignez les mamans qui suivent leur grossesse avec MamaTrack. Inscription en 30 secondes.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold py-3.5 px-10 rounded-2xl hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-200/50"
          >
            Créer mon compte gratuitement
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 max-w-4xl mx-auto border-t border-pink-100 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-[#3d2b2b]">MamaTrack</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Votre compagnon de grossesse gratuit, complet et sans pub.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-[#3d2b2b] uppercase tracking-wider mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-500 hover:text-pink-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-pink-50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} MamaTrack. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Fait avec amour en France</span>
            <span>·</span>
            <span>100% gratuit</span>
            <span>·</span>
            <span>Données sécurisées</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

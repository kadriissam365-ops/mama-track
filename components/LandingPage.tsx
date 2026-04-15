"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
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
  Droplets,
  Moon,
  FileText,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Settings,
  TrendingUp,
  Mail,
} from "lucide-react";

const features = [
  { icon: Baby, title: "Suivi semaine par semaine", desc: "Taille, poids, fruit de comparaison et conseils personnalisés chaque semaine", color: "bg-pink-100 text-pink-500" },
  { icon: Activity, title: "10+ trackers santé", desc: "Poids, eau, symptômes, humeur, tension, sommeil, contractions et plus", color: "bg-purple-100 text-purple-500" },
  { icon: Timer, title: "Chrono contractions", desc: "Minuteur précis avec historique, durée et fréquence en temps réel", color: "bg-indigo-100 text-indigo-500" },
  { icon: Users, title: "Mode duo", desc: "Partagez l'aventure avec votre partenaire qui suit tout en temps réel", color: "bg-emerald-100 text-emerald-500" },
  { icon: Camera, title: "Journal photo bump", desc: "Capturez chaque moment et comparez l'évolution de votre ventre", color: "bg-rose-100 text-rose-500" },
  { icon: Calendar, title: "Agenda médical", desc: "Tous vos rendez-vous organisés au même endroit avec rappels", color: "bg-orange-100 text-orange-500" },
  { icon: Heart, title: "250+ prénoms", desc: "Explorez, filtrez par origine et sauvegardez vos prénoms favoris", color: "bg-red-100 text-red-500" },
  { icon: BookOpen, title: "Guides complets", desc: "Alimentation, sport, FAQ et conseils validés par des professionnels", color: "bg-teal-100 text-teal-500" },
  { icon: FileText, title: "Projet naissance PDF", desc: "Créez et exportez votre projet de naissance personnalisé en PDF", color: "bg-blue-100 text-blue-500" },
  { icon: Moon, title: "Suivi sommeil & humeur", desc: "Notez votre qualité de sommeil et votre humeur jour après jour", color: "bg-violet-100 text-violet-500" },
];

const differentiators = [
  { icon: Shield, title: "100% gratuit, pour de vrai", desc: "Pas de version premium cachée, pas d'abonnement, pas de pub. Tout est accessible dès l'inscription." },
  { icon: Smartphone, title: "Aucun téléchargement requis", desc: "MamaTrack est une PWA : ouvrez-la dans votre navigateur et ajoutez-la à votre écran d'accueil. C'est tout !" },
  { icon: Star, title: "Mode FIV / PMA intégré", desc: "La seule app qui prend en compte les parcours de procréation médicalement assistée." },
  { icon: Droplets, title: "Fonctionne hors connexion", desc: "Vos données se synchronisent automatiquement dès que vous retrouvez internet." },
];

const testimonials = [
  { name: "Sarah M.", week: "32 SA", text: "Le mode duo a change notre grossesse ! Mon conjoint suit tout en temps reel, il se sent vraiment implique. On adore regarder l'evolution ensemble le soir.", avatar: "S", gradient: "from-pink-400 to-purple-400", rating: 5, feature: "Mode duo" },
  { name: "Fatima B.", week: "24 SA", text: "Apres 3 ans de PMA et un transfert FIV, j'avais besoin d'une app qui comprenne mon parcours. MamaTrack est la seule a gerer le calcul TEC. Enfin !", avatar: "F", gradient: "from-purple-400 to-pink-400", rating: 5, feature: "FIV / PMA" },
  { name: "Lea D.", week: "Jeune maman", text: "J'ai passe des heures sur l'outil prenoms avec mon mari ! On swipait chacun de notre cote et on comparait nos favoris. On a trouve LE prenom parfait.", avatar: "L", gradient: "from-pink-300 to-purple-500", rating: 4, feature: "Prenoms" },
  { name: "Amina K.", week: "36 SA", text: "Le journal de grossesse est devenu mon rituel du soir. Je note mes emotions, mes symptomes, et je relis les semaines passees. C'est precieux.", avatar: "A", gradient: "from-purple-300 to-pink-500", rating: 5, feature: "Journal" },
  { name: "Julie R.", week: "Jeune maman", text: "Le chrono contractions m'a sauvee la nuit de l'accouchement. Interface claire, gros boutons, pas besoin de reflechir. Mon mari chronometrait pendant que je respirais.", avatar: "J", gradient: "from-pink-400 to-purple-500", rating: 5, feature: "Contractions" },
  { name: "Marine L.", week: "30 SA", text: "La checklist m'a evite tellement d'oublis ! Valise maternite, papiers administratifs, achats bebe... tout est categorise et je coche au fur et a mesure.", avatar: "M", gradient: "from-purple-400 to-pink-300", rating: 4, feature: "Checklist" },
];

const faqItems = [
  { q: "MamaTrack est-il vraiment gratuit ?", a: "Oui, 100% gratuit sans pub ni abonnement cache. Toutes les fonctionnalites sont accessibles des la creation de votre compte." },
  { q: "Dois-je telecharger l'app sur l'App Store ?", a: "Non ! MamaTrack est une PWA (Progressive Web App). Ouvrez mamatrack.fr dans votre navigateur et ajoutez-le a votre ecran d'accueil pour une experience native." },
  { q: "Mes donnees sont-elles securisees ?", a: "Vos donnees sont chiffrees et stockees de facon securisee sur des serveurs europeens. Nous ne vendons et ne partageons aucune donnee personnelle." },
  { q: "Le mode duo, c'est quoi exactement ?", a: "Invitez votre partenaire a suivre votre grossesse en temps reel : evolution bebe, symptomes, rendez-vous, humeur. Il/elle recoit les mises a jour instantanement." },
  { q: "Puis-je utiliser MamaTrack hors connexion ?", a: "Oui ! En tant que PWA, MamaTrack fonctionne meme sans connexion internet. Vos donnees se synchronisent automatiquement des que vous etes reconnectee." },
  { q: "L'app prend-elle en compte les parcours PMA / FIV ?", a: "Absolument. MamaTrack est l'une des rares applications a integrer les specificites des parcours de procreation medicalement assistee dans le calcul des dates et le suivi." },
];

const footerLinks = [
  {
    title: "Fonctionnalites",
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
    title: "Legal",
    links: [
      { label: "Mentions legales", href: "/mentions-legales" },
      { label: "Politique de confidentialite", href: "/confidentialite" },
      { label: "CGU", href: "/cgu" },
    ],
  },
];

const weekPreviewData = [
  { week: 12, fruit: "Citron", emoji: "🍋", size: "5,4 cm" },
  { week: 20, fruit: "Banane", emoji: "🍌", size: "25 cm" },
  { week: 28, fruit: "Aubergine", emoji: "🍆", size: "37 cm" },
  { week: 36, fruit: "Melon", emoji: "🍈", size: "47 cm" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const howItWorksSteps = [
  { icon: UserPlus, title: "Inscrivez-vous", desc: "Creez votre compte en 30 secondes", color: "from-pink-400 to-rose-500" },
  { icon: Settings, title: "Configurez votre profil", desc: "Entrez votre date prevue d'accouchement", color: "from-purple-400 to-violet-500" },
  { icon: TrendingUp, title: "Suivez votre grossesse", desc: "Accedez a tous les outils de suivi", color: "from-emerald-400 to-teal-500" },
  { icon: Users, title: "Partagez en duo", desc: "Invitez votre partenaire a suivre", color: "from-blue-400 to-indigo-500" },
];

function useAnimatedCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const startAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, hasAnimated]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startAnimation(); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startAnimation]);

  return { count, ref };
}

function AnimatedStat({ value, label, icon }: { value: string; label: string; icon: string }) {
  const numericMatch = value.match(/^(\d+)(.*)$/);
  const target = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const suffix = numericMatch ? numericMatch[2] : value;
  const { count, ref } = useAnimatedCounter(target);

  return (
    <div ref={ref} className="text-center">
      <p className="text-sm mb-1">{icon}</p>
      <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        {numericMatch ? `${count}${suffix}` : value}
      </p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 overflow-x-hidden">
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
              "Application gratuite de suivi de grossesse semaine par semaine. Poids, symptomes, contractions, mode duo, prenoms, projet naissance et plus.",
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
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm shadow-pink-200/50">
              <Heart className="w-4.5 h-4.5 text-white fill-white" />
            </div>
            <span className="font-bold text-[#3d2b2b] text-lg tracking-tight">MamaTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-pink-500 transition-colors font-medium hidden sm:inline-block"
            >
              Connexion
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all shadow-sm shadow-pink-200/30"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 pt-20 pb-24 text-center max-w-3xl mx-auto">
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-12 left-8 text-4xl opacity-20 hidden sm:block"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          🍼
        </motion.div>
        <motion.div
          className="absolute top-24 right-10 text-3xl opacity-20 hidden sm:block"
          animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        >
          🧸
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-12 text-3xl opacity-15 hidden sm:block"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        >
          🌸
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-8 text-3xl opacity-15 hidden sm:block"
          animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
        >
          🤍
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 text-xs font-semibold px-4 py-2 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            100% gratuit &middot; Sans pub &middot; Sans abonnement
          </span>
        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.7 }}
          className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-pink-400 via-purple-400 to-emerald-300 rounded-[2.5rem] shadow-2xl shadow-pink-300/40 mb-10 relative"
        >
          <Heart className="w-16 h-16 text-white fill-white drop-shadow-sm" />
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3d2b2b] mb-5 leading-[1.1] tracking-tight"
        >
          Suivez votre grossesse
          <br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
            semaine par semaine
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-600 mb-3 max-w-lg mx-auto leading-relaxed"
        >
          Votre compagnon de grossesse complet, gratuit et sans pub.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm sm:text-base text-gray-500 mb-10 max-w-md mx-auto"
        >
          Du premier jour jusqu&apos;a la naissance : suivi bebe, 10+ trackers sante, mode duo, 250+ prenoms et projet naissance PDF.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center"
        >
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold py-4 px-8 rounded-2xl hover:from-pink-500 hover:to-purple-600 transition-all shadow-xl shadow-pink-300/30 text-center text-base"
          >
            Commencer gratuitement
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="text-pink-500 font-semibold py-4 px-6 hover:text-pink-600 hover:bg-pink-50 rounded-2xl transition-all text-center"
          >
            J&apos;ai deja un compte
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-gray-400 flex items-center justify-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" />
          Inscription en 30 secondes &middot; Aucune carte bancaire requise
        </motion.p>
      </section>

      {/* Social proof stats */}
      <section className="px-4 py-6 max-w-3xl mx-auto -mt-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="bg-white rounded-3xl border border-pink-100 shadow-lg shadow-pink-100/30 p-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "10+", label: "Trackers sante", icon: "📊" },
              { value: "250+", label: "Prenoms a explorer", icon: "💛" },
              { value: "40", label: "Semaines couvertes", icon: "📅" },
              { value: "0\u00a0\u20ac", label: "Pour toujours", icon: "🎉" },
            ].map((stat) => (
              <AnimatedStat key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Week preview / App preview */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Votre bebe grandit, <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">on vous montre tout</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Chaque semaine, decouvrez la taille de votre bebe comparee a un fruit, son developpement et des conseils personnalises.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {weekPreviewData.map((item, i) => (
            <motion.div
              key={item.week}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm hover:shadow-lg hover:border-pink-200 transition-all text-center group"
            >
              <motion.span
                className="text-5xl block mb-3"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {item.emoji}
              </motion.span>
              <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">Semaine {item.week}</p>
              <p className="text-sm font-bold text-[#3d2b2b]">{item.fruit}</p>
              <p className="text-xs text-gray-400 mt-1">{item.size}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Tout ce dont vous avez besoin, <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">en un seul endroit</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Une application complete pour vivre sereinement chaque etape de votre grossesse.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => {
            const colorParts = f.color.split(" ");
            const bgColor = colorParts[0];
            const textColor = colorParts[1];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group"
              >
                <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${textColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#3d2b2b] mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* App Preview Mockup */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="relative bg-gradient-to-br from-pink-100 via-purple-50 to-emerald-50 rounded-[2rem] p-8 sm:p-12 border border-pink-100 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #d1fae5 100%)" }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-4">
                Un tableau de bord clair et intuitif
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Retrouvez en un coup d&apos;oeil : votre semaine de grossesse, la progression, vos trackers sante, le prochain rendez-vous et le developpement de bebe.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Progression visuelle avec cercle anime",
                  "Comparaison fruit de la semaine",
                  "Compteur de jours restants",
                  "Acces rapide a tous vos trackers",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mini phone mockup */}
            <div className="flex-shrink-0">
              <div className="w-64 bg-[#0d0d1a] rounded-[2.5rem] shadow-2xl shadow-pink-200/40 border-[3px] border-gray-700 p-3 relative">
                {/* Phone notch */}
                <div className="w-24 h-5 bg-[#0d0d1a] rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
                </div>
                {/* Screen */}
                <div className="bg-gradient-to-b from-pink-50 to-white rounded-[2rem] p-4 pt-6 space-y-3">
                  {/* Progress ring + week */}
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 text-center relative">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-20 h-20" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                        <circle
                          cx="40" cy="40" r="34" fill="none" stroke="url(#progressGrad)" strokeWidth="5"
                          strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34 * 0.6} ${2 * Math.PI * 34 * 0.4}`}
                          transform="rotate(-90 40 40)"
                        />
                        <defs>
                          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>
                        <text x="40" y="36" textAnchor="middle" className="text-[11px] font-bold fill-[#3d2b2b]">24 SA</text>
                        <text x="40" y="48" textAnchor="middle" className="text-[8px] fill-gray-400">60%</text>
                      </svg>
                    </div>
                    <p className="text-3xl mb-0.5">🍌</p>
                    <p className="text-[10px] text-pink-500 font-semibold">Banane</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">112 jours restants</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-pink-50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-400">Poids</p>
                      <p className="text-sm font-bold text-[#3d2b2b]">65.2 kg</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-400">Eau</p>
                      <p className="text-sm font-bold text-[#3d2b2b]">1.5 L</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Prochain RDV</p>
                    <p className="text-xs font-semibold text-[#3d2b2b]">Echo T2 - 15 mai</p>
                  </div>
                  <div className="flex gap-1.5 justify-center pt-1">
                    <div className="w-8 h-1 bg-pink-300 rounded-full" />
                    <div className="w-8 h-1 bg-purple-200 rounded-full" />
                    <div className="w-8 h-1 bg-gray-200 rounded-full" />
                  </div>
                </div>
                {/* Home indicator */}
                <div className="w-28 h-1 bg-gray-600 rounded-full mx-auto mt-2" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Differentiators */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Pourquoi choisir <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">MamaTrack</span> ?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Concue par des parents, pour des parents. Pas de surprises, pas de frais caches.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <d.icon className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#3d2b2b] mb-1">{d.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comment ca marche */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Comment ca <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">marche</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Commencez a suivre votre grossesse en moins d&apos;une minute.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 sm:gap-0 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden sm:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {howItWorksSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex flex-col items-center text-center px-3 py-4 relative"
            >
              {/* Connecting line (mobile) */}
              {i < howItWorksSteps.length - 1 && (
                <motion.div
                  className="sm:hidden absolute left-1/2 top-[4.5rem] w-0.5 h-8 bg-gradient-to-b from-pink-200 to-purple-200 -translate-x-1/2"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  style={{ transformOrigin: "top" }}
                />
              )}

              {/* Numbered icon circle */}
              <div className={`relative w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
                <step.icon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-pink-100">
                  <span className="text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{i + 1}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#3d2b2b] mb-1">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-bold text-[#3d2b2b]">4.7</span>
            <span className="text-xs text-gray-400 ml-1">({testimonials.length} avis)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Ce qu&apos;elles en disent
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Des mamans font confiance a MamaTrack pour les accompagner tout au long de leur grossesse.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white rounded-3xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.gradient}`} />
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#3d2b2b]">{t.name}</p>
                  <p className="text-[11px] text-pink-400 font-semibold">{t.week}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              {t.feature && (
                <span className="inline-block mt-3 text-[10px] font-semibold bg-gradient-to-r from-pink-50 to-purple-50 text-purple-500 px-2.5 py-1 rounded-full border border-purple-100">
                  {t.feature}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d2b2b] mb-3">
            Questions frequentes
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Tout ce que vous devez savoir avant de commencer.
          </p>
        </motion.div>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 text-left text-sm font-semibold text-[#3d2b2b] flex items-center justify-between hover:bg-pink-50/50 transition-colors"
              >
                {item.q}
                <motion.span
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-pink-300 text-lg ml-3 flex-shrink-0"
                >
                  &#x25BE;
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openFaq === i ? "auto" : 0,
                  opacity: openFaq === i ? 1 : 0,
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((faqItem) => ({
                "@type": "Question",
                name: faqItem.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faqItem.a,
                },
              })),
            }),
          }}
        />
      </section>

      {/* Trust badges */}
      <section className="px-4 py-10 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8"
        >
          {[
            { icon: "🇫🇷", text: "Fait en France" },
            { icon: "🔒", text: "Donnees chiffrees" },
            { icon: "🚫", text: "Zero publicite" },
            { icon: "💶", text: "Gratuit pour toujours" },
            { icon: "📱", text: "Fonctionne hors ligne" },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span className="text-base">{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 pb-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="bg-gradient-to-br from-pink-100 via-purple-50 to-emerald-50 rounded-[2rem] p-10 sm:p-14 border border-pink-100 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #d1fae5 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl" />

          <motion.p
            className="text-6xl mb-5"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            🤰
          </motion.p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#3d2b2b] mb-4 relative z-10">
            Prete a commencer ?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-10 max-w-md mx-auto relative z-10">
            Rejoignez les mamans qui suivent leur grossesse avec MamaTrack. Inscription gratuite en 30 secondes.
          </p>
          <Link
            href="/auth/signup"
            className="relative z-10 inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold py-4 px-10 rounded-2xl hover:from-pink-500 hover:to-purple-600 transition-all shadow-xl shadow-pink-300/30 text-base"
          >
            Creer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-5 text-xs text-gray-400 relative z-10">
            Aucune carte bancaire requise &middot; Gratuit pour toujours
          </p>
        </motion.div>
      </section>

      {/* Newsletter / Early Access */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="bg-white rounded-3xl border border-pink-100 shadow-lg shadow-pink-100/30 p-8 sm:p-10 text-center"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-pink-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#3d2b2b] mb-2">
            Restez informee chaque semaine
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Recevez des conseils grossesse chaque semaine directement dans votre boite mail.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-5 py-3.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-pink-50/50 placeholder:text-gray-400"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold py-3.5 px-7 rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all shadow-md shadow-pink-200/30 text-sm whitespace-nowrap"
            >
              S&apos;inscrire
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-4">
            Pas de spam, desabonnement en un clic. Vos donnees restent privees.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-14 max-w-5xl mx-auto border-t border-pink-100 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-[#3d2b2b] text-lg">MamaTrack</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Votre compagnon de grossesse gratuit, complet et sans pub. Fait avec amour en France.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold text-[#3d2b2b] uppercase tracking-wider mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
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
            &copy; {new Date().getFullYear()} MamaTrack. Tous droits reserves.
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Fait avec amour en France</span>
            <span className="text-pink-200">&middot;</span>
            <span>100% gratuit</span>
            <span className="text-pink-200">&middot;</span>
            <span>Donnees securisees</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

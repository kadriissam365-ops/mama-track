"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 dark:from-[#0f0f1a] dark:via-[#0f0f1a] dark:to-[#1a1a2e] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-xl p-8 border border-pink-100 dark:border-pink-900 space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Conditions G&eacute;n&eacute;rales d&apos;Utilisation
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">Derni&egrave;re mise &agrave; jour : 15 avril 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 1 &mdash; Objet</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales d&apos;Utilisation (ci-apr&egrave;s &laquo; CGU &raquo;) ont pour objet de
              d&eacute;finir les conditions d&apos;acc&egrave;s et d&apos;utilisation de l&apos;application web MamaTrack,
              accessible &agrave; l&apos;adresse <a href="https://mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">mamatrack.fr</a>.
              L&apos;utilisation du service implique l&apos;acceptation pleine et enti&egrave;re des pr&eacute;sentes CGU.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 2 &mdash; Description du service</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack est une application web progressive (PWA) gratuite de suivi de grossesse qui propose :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 pl-2">
              <li>Suivi semaine par semaine de la grossesse</li>
              <li>Enregistrement du poids, des sympt&ocirc;mes et de l&apos;hydratation</li>
              <li>Chronom&egrave;tre de contractions</li>
              <li>Gestion des rendez-vous m&eacute;dicaux</li>
              <li>Mode duo pour partager le suivi avec un(e) partenaire</li>
              <li>G&eacute;n&eacute;rateur de pr&eacute;noms et projet de naissance</li>
              <li>Journal de grossesse et bump diary</li>
              <li>Guide alimentaire et informations sant&eacute;</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 3 &mdash; Acc&egrave;s au service</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Le service est accessible gratuitement &agrave; toute personne disposant d&apos;un acc&egrave;s &agrave; Internet.
              L&apos;inscription n&eacute;cessite une adresse email valide. L&apos;utilisatrice s&apos;engage &agrave; fournir
              des informations exactes lors de son inscription et &agrave; maintenir la confidentialit&eacute;
              de ses identifiants de connexion.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack se r&eacute;serve le droit de suspendre ou supprimer un compte en cas de
              violation des pr&eacute;sentes CGU, apr&egrave;s notification pr&eacute;alable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 4 &mdash; Gratuit&eacute;</h2>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
              <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                MamaTrack est enti&egrave;rement gratuit, sans publicit&eacute; et sans abonnement.
                Aucune donn&eacute;e utilisateur n&apos;est vendue &agrave; des tiers.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 5 &mdash; Avertissement sant&eacute;</h2>
            <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-4 border border-pink-100 dark:border-pink-900">
              <p className="text-pink-700 dark:text-pink-300 text-sm font-medium">
                MamaTrack est un outil d&apos;aide au suivi et ne constitue en aucun cas un dispositif
                m&eacute;dical, un diagnostic ou un avis m&eacute;dical. Les informations fournies (d&eacute;veloppement
                du b&eacute;b&eacute;, conseils, guide alimentaire) sont donn&eacute;es &agrave; titre informatif uniquement
                et ne sauraient se substituer &agrave; l&apos;avis de votre m&eacute;decin, sage-femme ou tout
                autre professionnel de sant&eacute;.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              En cas d&apos;urgence m&eacute;dicale, contactez le 15 (SAMU) ou le 112 (num&eacute;ro d&apos;urgence europ&eacute;en).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 6 &mdash; Obligations de l&apos;utilisatrice</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              L&apos;utilisatrice s&apos;engage &agrave; :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 pl-2">
              <li>Utiliser le service de mani&egrave;re conforme &agrave; sa destination</li>
              <li>Ne pas tenter d&apos;acc&eacute;der aux donn&eacute;es d&apos;autres utilisatrices</li>
              <li>Ne pas utiliser le service &agrave; des fins ill&eacute;gales ou contraires aux bonnes m&oelig;urs</li>
              <li>Ne pas tenter de compromettre la s&eacute;curit&eacute; ou le fonctionnement du service</li>
              <li>Prot&eacute;ger ses identifiants de connexion</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 7 &mdash; Donn&eacute;es personnelles</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Le traitement des donn&eacute;es personnelles est d&eacute;crit dans notre{" "}
              <Link href="/confidentialite" className="text-pink-500 dark:text-pink-400 underline">
                Politique de confidentialit&eacute;
              </Link>.
              Vos donn&eacute;es sont stock&eacute;es sur des serveurs Supabase situ&eacute;s dans l&apos;Union europ&eacute;enne
              et prot&eacute;g&eacute;es par des politiques de s&eacute;curit&eacute; Row Level Security (RLS).
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Conform&eacute;ment au RGPD, vous disposez d&apos;un droit d&apos;acc&egrave;s, de rectification, de
              suppression, de portabilit&eacute;, d&apos;opposition et de limitation du traitement de vos
              donn&eacute;es. Ces droits peuvent &ecirc;tre exerc&eacute;s en contactant{" "}
              <a href="mailto:dpo@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">dpo@mamatrack.fr</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 8 &mdash; Propri&eacute;t&eacute; intellectuelle</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              L&apos;ensemble des &eacute;l&eacute;ments composant MamaTrack (design, textes, code, illustrations,
              logos) sont prot&eacute;g&eacute;s par le droit de la propri&eacute;t&eacute; intellectuelle. Toute reproduction
              ou utilisation non autoris&eacute;e est strictement interdite.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 9 &mdash; Responsabilit&eacute;</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack s&apos;efforce d&apos;assurer la disponibilit&eacute; et le bon fonctionnement du service.
              Toutefois, MamaTrack ne saurait &ecirc;tre tenu responsable :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 pl-2">
              <li>Des interruptions temporaires li&eacute;es &agrave; la maintenance ou &agrave; des probl&egrave;mes techniques</li>
              <li>De l&apos;utilisation des informations fournies &agrave; des fins m&eacute;dicales</li>
              <li>Des dommages r&eacute;sultant de l&apos;utilisation ou de l&apos;impossibilit&eacute; d&apos;utiliser le service</li>
              <li>De la perte de donn&eacute;es r&eacute;sultant d&apos;un cas de force majeure</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 10 &mdash; Mode duo</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Le mode duo permet de partager certaines donn&eacute;es de suivi avec un(e) partenaire
              via un code d&apos;invitation. L&apos;activation de cette fonctionnalit&eacute; est volontaire.
              L&apos;utilisatrice reste responsable du partage de son code d&apos;invitation et peut
              r&eacute;voquer l&apos;acc&egrave;s du partenaire &agrave; tout moment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 11 &mdash; Modification des CGU</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack se r&eacute;serve le droit de modifier les pr&eacute;sentes CGU &agrave; tout moment.
              Les utilisatrices seront inform&eacute;es de toute modification substantielle.
              La poursuite de l&apos;utilisation du service apr&egrave;s modification vaut acceptation
              des nouvelles CGU.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 12 &mdash; Droit applicable</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Les pr&eacute;sentes CGU sont r&eacute;gies par le droit fran&ccedil;ais. En cas de litige, une solution
              amiable sera recherch&eacute;e en priorit&eacute;. &Agrave; d&eacute;faut, les tribunaux fran&ccedil;ais seront
              seuls comp&eacute;tents.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Article 13 &mdash; Contact</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Pour toute question relative aux pr&eacute;sentes CGU :<br />
              Email : <a href="mailto:contact@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">contact@mamatrack.fr</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

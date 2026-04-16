"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MentionsLegalesPage() {
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
            Mentions L&eacute;gales
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">Derni&egrave;re mise &agrave; jour : 15 avril 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">&Eacute;diteur du site</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Le site <strong>mamatrack.fr</strong> et l&apos;application web MamaTrack sont &eacute;dit&eacute;s par :<br />
              MamaTrack<br />
              Statut : Micro-entreprise<br />
              Si&egrave;ge social : France<br />
              Email de contact : <a href="mailto:contact@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">contact@mamatrack.fr</a><br />
              Directeur de la publication : L&apos;&eacute;quipe MamaTrack
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">H&eacute;bergement</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              L&apos;application est h&eacute;berg&eacute;e par :<br />
              <strong>Vercel Inc.</strong> &mdash; 440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
              Site web : <a href="https://vercel.com" className="text-pink-500 dark:text-pink-400 underline" target="_blank" rel="noopener noreferrer">vercel.com</a><br /><br />
              Les donn&eacute;es utilisateur sont stock&eacute;es sur :<br />
              <strong>Supabase</strong> &mdash; serveurs situ&eacute;s dans l&apos;Union europ&eacute;enne (r&eacute;gion eu-west)<br />
              Site web : <a href="https://supabase.com" className="text-pink-500 dark:text-pink-400 underline" target="_blank" rel="noopener noreferrer">supabase.com</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nature du service</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack est une application web progressive (PWA) gratuite de suivi de grossesse.
              Elle permet aux utilisatrices de suivre leur grossesse semaine par semaine, enregistrer
              leur poids, sympt&ocirc;mes, rendez-vous m&eacute;dicaux, et autres informations relatives &agrave; leur sant&eacute;.
            </p>
            <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-4 border border-pink-100 dark:border-pink-900">
              <p className="text-sm text-pink-700 dark:text-pink-300 font-medium">
                MamaTrack ne constitue en aucun cas un dispositif m&eacute;dical et ne remplace pas
                l&apos;avis d&apos;un professionnel de sant&eacute;. Les informations fournies le sont &agrave; titre
                indicatif uniquement. En cas de doute ou d&apos;urgence, consultez votre m&eacute;decin
                ou sage-femme.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Propri&eacute;t&eacute; intellectuelle</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              L&apos;ensemble des contenus pr&eacute;sents sur MamaTrack (textes, images, illustrations,
              logos, ic&ocirc;nes, code source) sont la propri&eacute;t&eacute; exclusive de MamaTrack ou de
              ses partenaires. Toute reproduction, repr&eacute;sentation, modification ou adaptation,
              totale ou partielle, est strictement interdite sans autorisation &eacute;crite pr&eacute;alable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Donn&eacute;es personnelles</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD) et
              &agrave; la loi Informatique et Libert&eacute;s, vous disposez de droits sur vos donn&eacute;es
              personnelles. Pour en savoir plus, consultez notre{" "}
              <Link href="/confidentialite" className="text-pink-500 dark:text-pink-400 underline">
                Politique de confidentialit&eacute;
              </Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack utilise uniquement des cookies techniques essentiels au fonctionnement
              de l&apos;application (authentification, pr&eacute;f&eacute;rences utilisateur). Aucun cookie
              publicitaire ou de tra&ccedil;age tiers n&apos;est utilis&eacute;.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Contact</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Pour toute question relative aux mentions l&eacute;gales, vous pouvez nous contacter &agrave;
              l&apos;adresse : <a href="mailto:contact@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">contact@mamatrack.fr</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

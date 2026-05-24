"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ConfidentialitePage() {
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
            Politique de Confidentialit&eacute;
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">Derni&egrave;re mise &agrave; jour : 19 mai 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack (<a href="https://mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">mamatrack.fr</a>) s&apos;engage &agrave;
              prot&eacute;ger la vie priv&eacute;e de ses utilisatrices. La pr&eacute;sente politique de confidentialit&eacute;
              d&eacute;crit les donn&eacute;es que nous collectons, comment nous les utilisons et les droits
              dont vous disposez, conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des
              Donn&eacute;es (RGPD &mdash; R&egrave;glement UE 2016/679) et &agrave; la loi Informatique et Libert&eacute;s.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Responsable du traitement</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Le responsable du traitement des donn&eacute;es est MamaTrack.<br />
              Email : <a href="mailto:dpo@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">dpo@mamatrack.fr</a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Donn&eacute;es collect&eacute;es</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Dans le cadre de l&apos;utilisation de MamaTrack, nous collectons les cat&eacute;gories
              de donn&eacute;es suivantes :
            </p>
            <div className="space-y-2">
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-100 dark:border-purple-900">
                <h3 className="font-medium text-purple-700 dark:text-purple-300 text-sm mb-1">Donn&eacute;es d&apos;identification</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Adresse email, pr&eacute;nom, pr&eacute;nom du b&eacute;b&eacute; (optionnel)</p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-4 border border-pink-100 dark:border-pink-900">
                <h3 className="font-medium text-pink-700 dark:text-pink-300 text-sm mb-1">Donn&eacute;es de sant&eacute;</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Date pr&eacute;vue d&apos;accouchement, poids, sympt&ocirc;mes, contractions, mode de conception,
                  rendez-vous m&eacute;dicaux, hydratation, m&eacute;dicaments. Ces donn&eacute;es sont consid&eacute;r&eacute;es
                  comme des donn&eacute;es sensibles au sens de l&apos;article 9 du RGPD.
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
                <h3 className="font-medium text-emerald-700 dark:text-emerald-300 text-sm mb-1">Donn&eacute;es techniques</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Donn&eacute;es de navigation (type de navigateur, appareil), strictement n&eacute;cessaires au fonctionnement de l&apos;application.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Base l&eacute;gale du traitement</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Le traitement de vos donn&eacute;es repose sur :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 pl-2">
              <li><strong>Votre consentement explicite</strong> (article 6.1.a et 9.2.a du RGPD) pour les donn&eacute;es de sant&eacute;</li>
              <li><strong>L&apos;ex&eacute;cution du contrat</strong> (article 6.1.b du RGPD) pour la fourniture du service</li>
              <li><strong>L&apos;int&eacute;r&ecirc;t l&eacute;gitime</strong> (article 6.1.f du RGPD) pour l&apos;am&eacute;lioration du service</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Finalit&eacute;s du traitement</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 pl-2">
              <li>Fournir le service de suivi de grossesse personnalis&eacute;</li>
              <li>Sauvegarder et synchroniser vos donn&eacute;es entre vos appareils</li>
              <li>Permettre le partage en mode duo avec votre partenaire (si activ&eacute;)</li>
              <li>Am&eacute;liorer l&apos;application et corriger les dysfonctionnements</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Stockage et s&eacute;curit&eacute;</h2>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-pink-100 dark:border-pink-900">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Vos donn&eacute;es sont stock&eacute;es sur des <strong>serveurs Supabase situ&eacute;s dans l&apos;Union europ&eacute;enne</strong> (r&eacute;gion eu-west).
                La communication est chiffr&eacute;e via HTTPS/TLS. L&apos;acc&egrave;s aux donn&eacute;es est prot&eacute;g&eacute; par
                des politiques de s&eacute;curit&eacute; Row Level Security (RLS), garantissant que chaque
                utilisatrice n&apos;acc&egrave;de qu&apos;&agrave; ses propres donn&eacute;es.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Certaines donn&eacute;es sont &eacute;galement stock&eacute;es localement sur votre appareil (localStorage)
              pour permettre une utilisation hors-ligne.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Partage des donn&eacute;es</h2>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
              <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                MamaTrack ne vend jamais vos donn&eacute;es. Nous ne partageons jamais vos donn&eacute;es
                personnelles ou de sant&eacute; avec des tiers &agrave; des fins commerciales ou publicitaires.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Vos donn&eacute;es peuvent &ecirc;tre acc&eacute;d&eacute;es uniquement par :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1 pl-2">
              <li><strong>Supabase Inc.</strong> (Etats-Unis, serveurs UE Francfort) : h&eacute;bergeur de la base de donn&eacute;es. Sous-traitant RGPD.</li>
              <li><strong>Vercel Inc.</strong> (Etats-Unis) : h&eacute;bergeur de l&apos;application web.</li>
              <li><strong>Resend</strong> (Etats-Unis) : envoi des emails transactionnels (magic link, rappels). Donn&eacute;es transmises : email uniquement.</li>
              <li><strong>Stripe Payments Europe Ltd.</strong> (Irlande) : traitement des paiements Premium (uniquement si vous souscrivez). Donn&eacute;es transmises : email + ID de session.</li>
              <li><strong>Votre partenaire</strong> : uniquement si vous activez le mode duo et partagez votre code d&apos;invitation.</li>
            </ul>
          </section>

          <section className="space-y-3" id="ia-tiers">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Partage avec des services d&apos;intelligence artificielle
            </h2>
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-100 dark:border-purple-900 space-y-3">
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                Certaines fonctionnalit&eacute;s optionnelles (MamaCoach IA, analyse d&apos;&eacute;chographie,
                d&apos;ordonnance, d&apos;analyses sanguines) reposent sur des mod&egrave;les d&apos;intelligence
                artificielle h&eacute;berg&eacute;s par des prestataires tiers. Ces fonctionnalit&eacute;s ne
                sont activ&eacute;es <strong>qu&apos;apr&egrave;s votre consentement explicite</strong> (case
                &agrave; cocher d&eacute;di&eacute;e &laquo;&nbsp;Activer MamaCoach IA&nbsp;&raquo;).
              </p>

              <div className="space-y-2">
                <p className="font-medium text-purple-700 dark:text-purple-200 text-sm">
                  Prestataire principal : Anthropic, PBC
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside leading-relaxed">
                  <li>Mod&egrave;le utilis&eacute; : Claude (claude-haiku-4-5)</li>
                  <li>Si&egrave;ge : San Francisco, USA</li>
                  <li>Donn&eacute;es transmises : votre message dans le chat + r&eacute;sum&eacute; non nominatif de votre contexte de grossesse (semaine, derniers relev&eacute;s agr&eacute;g&eacute;s)</li>
                  <li>Finalit&eacute; : g&eacute;n&eacute;rer une r&eacute;ponse personnalis&eacute;e</li>
                  <li>Conservation : aucune (API &laquo;&nbsp;zero data retention&nbsp;&raquo;, les donn&eacute;es ne sont pas utilis&eacute;es pour l&apos;entra&icirc;nement)</li>
                  <li>Politique de confidentialit&eacute; : <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-500 dark:text-pink-300 underline">anthropic.com/legal/privacy</a></li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-purple-700 dark:text-purple-200 text-sm">
                  Prestataire de secours : Google LLC
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside leading-relaxed">
                  <li>Mod&egrave;le utilis&eacute; : Gemini (gemini-2.5-flash), uniquement en <em>fallback</em> texte si Claude est indisponible et pour les fonctionnalit&eacute;s vision (analyse d&apos;image)</li>
                  <li>Si&egrave;ge : Mountain View, USA</li>
                  <li>Donn&eacute;es transmises : votre message + contexte (texte) <em>ou</em> votre image (&eacute;chographie / ordonnance / analyses), sans email ni identifiant utilisateur</li>
                  <li>Finalit&eacute; : g&eacute;n&eacute;rer la r&eacute;ponse texte ou extraire les informations de l&apos;image</li>
                  <li>Conservation : les donn&eacute;es envoy&eacute;es via l&apos;API Gemini ne sont <strong>pas utilis&eacute;es pour entra&icirc;ner</strong> les mod&egrave;les Google (API payante, voir conditions Gemini API)</li>
                  <li>Politique de confidentialit&eacute; : <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-500 dark:text-pink-300 underline">policies.google.com/privacy</a></li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-100 dark:border-amber-900/40">
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Transferts hors UE</strong> : les transferts vers les Etats-Unis sont
                  encadr&eacute;s par les <strong>Clauses Contractuelles Types</strong> (CCT) adopt&eacute;es par
                  la Commission europ&eacute;enne (d&eacute;cision 2021/914) et, selon le prestataire, par le
                  cadre Data Privacy Framework (DPF) UE-USA.
                </p>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Vous pouvez <strong>r&eacute;voquer votre consentement &agrave; tout moment</strong> dans
                Param&egrave;tres &rarr; Confidentialit&eacute; &rarr; Couper l&apos;IA. Aucune fonctionnalit&eacute; IA
                n&apos;envoie de donn&eacute;es tant que le consentement n&apos;a pas &eacute;t&eacute; donn&eacute;.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Dur&eacute;e de conservation</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Vos donn&eacute;es sont conserv&eacute;es tant que votre compte est actif. En cas de suppression
              de votre compte, toutes vos donn&eacute;es sont d&eacute;finitivement effac&eacute;es dans un d&eacute;lai
              de 30 jours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Vos droits (RGPD)</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Conform&eacute;ment au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: "Droit d'acc\u00e8s", desc: "Obtenir une copie de vos donn\u00e9es personnelles" },
                { title: "Droit de rectification", desc: "Corriger vos donn\u00e9es inexactes ou incompl\u00e8tes" },
                { title: "Droit \u00e0 l'effacement", desc: "Demander la suppression de vos donn\u00e9es" },
                { title: "Droit \u00e0 la portabilit\u00e9", desc: "R\u00e9cup\u00e9rer vos donn\u00e9es dans un format structur\u00e9" },
                { title: "Droit d'opposition", desc: "Vous opposer au traitement de vos donn\u00e9es" },
                { title: "Droit de limitation", desc: "Limiter le traitement de vos donn\u00e9es" },
              ].map((right) => (
                <div key={right.title} className="bg-gray-50 dark:bg-[#0f0f1a] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{right.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Pour exercer vos droits, contactez-nous &agrave; :&nbsp;
              <a href="mailto:dpo@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">dpo@mamatrack.fr</a>.
              Nous r&eacute;pondrons dans un d&eacute;lai maximum de 30 jours.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Vous pouvez &eacute;galement d&eacute;poser une r&eacute;clamation aupr&egrave;s de la&nbsp;
              <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libert&eacute;s) :&nbsp;
              <a href="https://www.cnil.fr" className="text-pink-500 dark:text-pink-400 underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              MamaTrack utilise uniquement des <strong>cookies strictement n&eacute;cessaires</strong> au
              fonctionnement du service (authentification, session utilisateur). Aucun cookie
              publicitaire, analytique tiers ou de tra&ccedil;age n&apos;est d&eacute;pos&eacute;.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Modifications</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Nous nous r&eacute;servons le droit de modifier cette politique de confidentialit&eacute;.
              En cas de modification substantielle, vous serez inform&eacute;(e) via l&apos;application
              ou par email. La date de derni&egrave;re mise &agrave; jour est indiqu&eacute;e en haut de cette page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Contact</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Pour toute question relative &agrave; la protection de vos donn&eacute;es :<br />
              Email : <a href="mailto:dpo@mamatrack.fr" className="text-pink-500 dark:text-pink-400 underline">dpo@mamatrack.fr</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

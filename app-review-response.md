# Réponse au App Review — Rejet 1.0(2) du 19 mai 2026

Submission ID : `f94fb4bd-e9ad-43cf-affb-fffd9cc3c7c8`
Build rejeté : 1.0 (2)
Date du rejet : 2026-05-19
Reviewer : iPad Air 11-inch (M3)

---

## ⚠️ Bloquant identifié : 5.1.1(ix) — Compte individuel vs organisation

Apple exige que les apps qui « fournissent un service hautement régulé ou manipulent des données utilisateur sensibles » soient publiées depuis un compte **Apple Developer Program enregistré en tant qu'organisation**, pas en tant qu'individu.

**Ton compte actuel est enregistré en tant qu'Individual.** Tu as 3 options :

### Option A — Convertir le compte en Organization (recommandée si SIRET)
- Possible uniquement si tu as un **SIRET / SIREN** (auto-entrepreneur ou société) **et un numéro DUNS** (gratuit via Dun & Bradstreet, ~2 semaines pour l'obtenir).
- Procédure : Contacter Apple Developer Support → demander la conversion individual → organization.
- Délai total estimé : 3-6 semaines (DUNS + validation Apple).
- Aucune perte de l'app, juste un changement de raison sociale.
- Coût : aucun supplémentaire (la cotisation 99 $/an reste la même).
- **Action concrète** : aller sur https://developer.apple.com/contact/, choisir « Account » puis « Convert Individual to Organization », expliquer la situation MamaTrack.

### Option B — Repositionner l'app comme « non médicale » et argumenter
- Demander à Apple de reconsidérer 5.1.1(ix) en arguant que MamaTrack est un **journal de bien-être / lifestyle**, pas un dispositif médical.
- Pour que cet argument tienne, il faut **retirer ou neutraliser** les fonctionnalités qui pourraient être qualifiées de « medical advice » :
  - **Scan d'ordonnance via IA** (`/components/ScanOrdonnance.tsx`) → désactiver ou repositionner « aide-mémoire personnel ».
  - **Scan analyses sanguines** (`/components/ScanAnalysesSang.tsx`) → idem.
  - **Scan échographie** (`/components/ScanEchographie.tsx`) → idem ou retirer.
  - MamaCoach → préciser que c'est un assistant de discussion, jamais un avis médical.
  - Toutes les pages `/urgences`, `/conseils` → ajouter en bandeau visible « Information générale, ne constitue pas un diagnostic ».
- Risque : Apple peut rejeter à nouveau au prochain cycle de vérification ; ce n'est pas une garantie.

### Option C — Soumettre depuis un compte d'organisation existant
- Si quelqu'un de ta famille / un proche a déjà un compte Org (SIRET + DUNS), tu peux publier sous ce compte.
- Voir https://developer.apple.com/help/account/transfer-an-app — l'app peut ensuite être transférée plus tard.

**Décision à prendre AVANT le re-submit. Sans elle, le re-submit sera à nouveau rejeté sur 5.1.1(ix).**

---

## Réponse type à coller dans App Store Connect → Reply to App Review

> Bonjour,
>
> Merci pour votre retour détaillé. Nous avons retravaillé l'app pour répondre point par point aux trois axes (1.4.1 Safety, 5.1.1 Privacy, 2.1 Information Needed). Le compte développeur va être [converti en Organization / fait l'objet d'une demande de réexamen — choisir selon Option A ou B] pour 5.1.1(ix).
>
> ## 1.4.1 — Medical disclaimer & citations
>
> MamaTrack est positionnée comme **outil d'accompagnement et de bien-être** pour les femmes enceintes, **pas comme un dispositif médical**. L'app ne fournit aucun diagnostic, ne calcule aucune dose médicamenteuse et ne remplace pas un suivi médical professionnel.
>
> Modifications apportées dans la build 1.0(3) :
> - Toutes les pages contenant des informations médicales (`/conseils`, `/urgences`, `/alimentation`) affichent désormais un encart **« Sources et références médicales »** listant les autorités publiques (Haute Autorité de Santé, Ameli, ANSES, ANSM, OMS, CRAT, Santé Publique France, CNGOF, INSERM) avec lien direct.
> - Disclaimer médical présent sur chaque page : « Information générale, ne remplace pas un avis médical ».
> - MamaCoach affiche un disclaimer permanent en bas du chat : « En cas d'urgence : 15, 18 ou maternité de garde ».
>
> Concernant la « regulatory clearance » : MamaTrack n'est pas un dispositif médical au sens du règlement UE 2017/745 (Medical Device Regulation). Elle ne calcule pas de diagnostic, ne déclenche pas d'alarme médicale et n'est pas remboursable par la Sécurité Sociale. Elle entre dans la catégorie « lifestyle / wellness apps » comme la plupart des trackers de grossesse disponibles sur l'App Store (Flo, Ovia, Pregnancy+, Premom).
>
> ## 5.1.1(i) et 5.1.2(i) — Données envoyées aux services IA
>
> Modifications apportées dans la build 1.0(3) :
> - **Écran de consentement explicite** ajouté avant TOUTE utilisation des fonctionnalités IA (chat MamaCoach + scan échographie/ordonnance/analyses sanguines). L'utilisateur ne peut PAS envoyer de données tant qu'il n'a pas coché la case « J'accepte ».
> - L'écran de consentement liste précisément :
>   - **Quelles données sont envoyées** : messages du chat, semaine de grossesse, derniers relevés agrégés (sans nom ni email) — ou l'image du document médical pour le scan.
>   - **À qui** : Anthropic, PBC (USA) — modèle Claude — en principal, et Google LLC (USA) — modèle Gemini — en fallback texte / pour la vision.
>   - **Engagements** : aucune utilisation pour entraînement de modèles, encadrement par les Clauses Contractuelles Types UE, conservation zéro côté Anthropic.
> - **Politique de confidentialité** (https://mamatrack.fr/confidentialite) mise à jour avec une section dédiée « Partage avec des services d'intelligence artificielle » qui nomme Anthropic et Google, précise les données transmises, la finalité, la conservation, le cadre juridique (CCT UE).
> - **Réglages → Intelligence artificielle** : un interrupteur permet de couper l'IA et de révoquer le consentement à tout moment.
>
> ## 1.4.1 — Citations des sources médicales
>
> La build 1.0(3) ajoute un composant `MedicalSources` qui s'affiche en bas de chaque page contenant des recommandations médicales :
> - `/conseils` (onglet « Cette semaine » + onglet « FAQ ») : sources HAS, Ameli, OMS, INSERM, ANSM, CRAT.
> - `/urgences` : sources Ameli (urgences grossesse), HAS, CNGOF, Santé Publique France.
> - `/alimentation` : sources Ameli, ANSES, Mangerbouger.fr, Santé Publique France (toxoplasmose), DGCCRF (listériose).
>
> Chaque source est cliquable et redirige vers la page officielle correspondante.
>
> ## 2.1(b) — Business model
>
> 1. **Utilisateurs** : les futures mamans (et leur partenaire via le mode duo). 18+ uniquement.
> 2. **Où acheter le contenu payant** : actuellement nulle part DANS l'app iOS. Le Premium MamaCoach est accessible **uniquement via le site web mamatrack.fr** sur navigateur classique (paiement Stripe). Dans la build iOS, toute mention de Premium / abonnement est **masquée** (vérifiable dans les composants `Paywall`, `PremiumCard`, settings → Abonnement) car l'app iOS bascule en mode « tout est offert gratuitement » sur native iOS via le hook `useIsIOSNative()`.
> 3. **Contenu déverrouillé dans l'app** : tout est gratuit dans la version iOS. Aucun paywall, aucun abonnement, aucune fonctionnalité bloquée.
> 4. **Paid content / features NOT via IAP** : aucun dans l'app iOS. (Sur le web, hors App Store, le Premium MamaCoach passe par Stripe.)
> 5. **Sold to** : à des consommateurs individuels (B2C), pas à des entreprises ni à des familles.
>
> ## 5.1.1(ix) — Compte développeur
>
> [À adapter selon l'option choisie :]
>
> **Option A** : « Nous initions la conversion de notre compte Individual vers Organization. Une demande a été déposée auprès d'Apple Developer Support le [date] et nous attendons l'obtention du numéro DUNS pour [nom de l'entreprise / SIREN]. Nous resoumettrons l'app une fois la conversion finalisée. »
>
> **Option B** : « Nous avons retiré ou repositionné toutes les fonctionnalités qui pouvaient être interprétées comme du conseil médical (scan d'ordonnance désactivé, scan échographie désactivé, scan analyses désactivé). L'app est positionnée comme un journal de bien-être grossesse, dans la même catégorie que Flo (Ovia, Pregnancy+, etc.), sans diagnostic ni calcul médical. Nous demandons un nouvel examen sur cette base. »
>
> Cordialement,
> Issam Kadri — kadriissam365@gmail.com
> Compte test reviewer : kadriissam365+reviewer@gmail.com / MamaReview2026!Apple

---

## Checklist code → build 1.0(3)

- [x] `components/AiConsentGate.tsx` créé : écran de consentement IA réutilisable.
- [x] `lib/use-ai-consent.ts` créé : hook React + localStorage `mamatrack:ai-consent:v1`.
- [x] `/coach` enveloppé par `AiConsentGate` — le fetch du tip hebdo + le chat sont bloqués sans consentement.
- [x] `ScanEchographie`, `ScanAnalysesSang`, `ScanOrdonnance` : le bouton est remplacé par un CTA « Activer l'IA » qui pointe vers `/coach` si consentement manquant.
- [x] `/confidentialite` : ajout d'une section « Partage avec des services d'intelligence artificielle » qui nomme Anthropic + Google, détaille données / finalité / conservation / cadre juridique.
- [x] `/settings` : toggle « Intelligence artificielle » pour activer / révoquer le consentement, avec date d'acceptation.
- [x] `MedicalSources` component + intégration dans `/conseils`, `/urgences`, `/alimentation`.
- [ ] **iOS Info.plist** : aucune modification nécessaire (NSUserTrackingUsageDescription déjà retiré en 1.0(2)).
- [ ] **Bump CFBundleVersion** : 2 → 3 dans `ios/App/App.xcodeproj/project.pbxproj` (CURRENT_PROJECT_VERSION).
- [ ] **Build + cap sync ios** : `bun run build && npx cap sync ios`.
- [ ] **Archive + upload** : via Xcode 26 ou xcodebuild + altool.
- [ ] **App Privacy** sur App Store Connect : déclarer **Diagnostics → Données d'utilisation** = NON, **Identifiants** → ID utilisateur (Supabase UUID), **Coordonnées** → Adresse e-mail, **Santé et forme** → Santé (lié à l'identité, finalité Fonctionnalité de l'app), **Contenu utilisateur** → Photos (pour bump photos / scans) → lié à l'identité, finalité Fonctionnalité de l'app. Tracking = NON.
- [ ] **App Review Information** : préciser dans « Notes » que le contenu payant n'est PAS accessible dans l'app iOS (uniquement sur mamatrack.fr web), inclure le mot de passe reviewer.

---

## Documents à joindre en pièce attachée

Si Apple redemande des justificatifs :
- **Politique de confidentialité publique** : https://mamatrack.fr/confidentialite
- **Sources médicales** : déjà visibles dans l'app via `MedicalSources` (HAS, Ameli, ANSES, OMS).
- **Pas de regulatory clearance** : argumenter que l'app n'est pas un dispositif médical au sens du règlement UE MDR 2017/745.

# Refonte MamaTrack — de la grossesse aux 6 ans

## Mission du 6 octobre 2026

Une plateforme familiale continue : grossesse, naissance confirmée, 0–3 ans, puis 3–6 ans. Refonte de l'accueil, de la connexion, de l'entrée dans les parcours, de la navigation, des tableaux de bord et des composants partagés. Identité crème, sauge et terre cuite ; illustration originale, typographie éditoriale, cartes lisibles, mouvements sobres et respect de la réduction des animations.

## Repères étudiés

- [Huckleberry — suivi](https://huckleberrycare.com/product/tracking) : saisie courte, accueil personnalisable et coordination des proches.
- [Nara — carnet familial](https://nara.com/pages/nara-baby-tracker-app?pp=1) : cohérence grossesse/post-partum/enfant, plusieurs enfants et partage des activités.
- [Philips Pregnancy+](https://www.philips.com/a-w/about/news/archive/standard/news/articles/2026/world-leading-pregnancy-app-philips-avent-pregnancy-brings-moms-together-with-community-feature) : présentation visuelle de la progression et sentiment de continuité.
- [May — rapport 2025](https://www.may.app/wp-content/uploads/2026/02/Rapport-de-mission-May-2025.pdf) : calendrier personnalisé et accompagnement adapté au contexte.

Ces références inspirent les choix de conception. Elles ne prouvent pas une supériorité du produit et aucun témoignage ou nombre d'utilisateurs fictif ne sera présenté comme réel.

## Règles de continuité

- Atteindre le terme déclenche une invitation à confirmer la naissance, jamais une naissance inventée.
- La confirmation utilise la fonction SQL atomique existante : carnet créé une fois, profil grossesse conservé, ouverture automatique du carnet enfant.
- Le troisième anniversaire adapte automatiquement l'espace de l'enfant, sans déplacer ni recréer son historique.
- Chaque enfant garde sa phase et ses droits ; un nouveau suivi grossesse reste possible.
- Les anciens comptes BabyTrack récupèrent leur carnet par le transfert authentifié existant.

## Santé et développement

- [Calendrier simplifié 2026 — Santé publique France](https://www.santepubliquefrance.fr/sites/default/files/cadic_files/documents/spf00006840.pdf), mise à jour septembre 2026.
- [Service Public — calendrier des vaccinations](https://www.service-public.gouv.fr/particuliers/vosdroits/F724).
- Ne pas marquer les vaccinations recommandées comme obligatoires. Préserver les anciens enregistrements après mise à jour des libellés et âges.
- La confirmation d'un vaccin provient du carnet familial, les échéances de l'âge réel. Les situations de rattrapage sont à valider par un professionnel.
- Les courbes de référence ne doivent jamais être extrapolées au-delà des tables disponibles.
- Les mesures restent enregistrables jusqu’à 6 ans. Les références présentes dans le dépôt couvrent seulement 0–36 mois ; les percentiles ne sont pas affichés au-delà ni lorsque le sexe de référence est inconnu.
- [Service Public — examens de santé](https://www.service-public.gouv.fr/particuliers/vosdroits/F967) et [Ameli — suivi de 4 à 10 ans](https://www.ameli.fr/assure/sante/themes/suivi-medical-de-l-enfant-et-de-l-adolescent/suivi-medical-entre-4-et-10-ans).
- [CDC — repères à 3 ans](https://www.cdc.gov/act-early/milestones/3-years.html), [4 ans](https://www.cdc.gov/act-early/milestones/4-years.html), [5 ans](https://www.cdc.gov/act-early/milestones/5-years.html) et [accompagnement de 3 à 5 ans](https://www.cdc.gov/child-development/positive-parenting-tips/preschooler-3-5-years.html). Les petites fiertés sont des souvenirs, sans score ni diagnostic.

## Fonctionnalités livrées

- Accueil éditorial, illustration originale, aperçu interactif des trois parcours et connexion renouvelée ; navigation commune sur téléphone et ordinateur.
- Tableaux de bord grossesse et enfant, plusieurs enfants, naissance confirmée et adaptation au troisième anniversaire. Le calcul des jours avant le terme utilise le jour civil à Paris, y compris le jour du terme.
- Rituels personnalisables : matin, soir ou à tout moment, cases quotidiennes partagées, historique de sept jours, archivage et restauration.
- Huit idées d’activités pour les 3–6 ans, avec souvenir réellement enregistré dans le journal.
- Examens annuels jusqu’à 6 ans, vaccinations et rappel de 6 ans, repères de développement, conseils et assistant parental adaptés à l’âge.
- Export des rituels et de leurs validations quotidiennes. Les droits propriétaire/proche/lecture seule sont conservés ; les actions médicales vérifient aussi que l’enfant sélectionné n’a pas changé entre ouverture et envoi du formulaire.
- Icône et métadonnées actualisées. Le service worker version 10 purge les anciens caches MamaTrack ; il est désactivé en développement et ne conserve pas les données privées.

## Vérifications réalisées

- 76 tests passent dans sept fichiers, dont les politiques SQL exécutées par PGlite, les droits des rituels, les limites de dates, les anniversaires, les visites et la compatibilité des anciens vaccins.
- TypeScript sans erreur ; ESLint sans erreur, avec 66 avertissements ; compilation de production Next.js 16.3.6 réussie avec Webpack.
- Auth, PostgreSQL 17 et PostgREST locaux : naissance puis ouverture automatique du carnet, ajout d’un enfant de 4 ans, choix entre quatre enfants, rituels cochés retrouvés après rechargement, archivage/restauration sans perte et souvenir d’activité retrouvé dans le journal.
- Examen de 4–5 ans et petite fierté : enregistrement, rechargement et correction par les formulaires du navigateur.
- Huit pages du parcours enfant contrôlées à 390 px sans débordement horizontal. Accueil compilé contrôlé sur téléphone et ordinateur ; aperçu utilisable avec les touches de direction, Début et Fin.
- Formulaire de connexion contrôlé en clair et en sombre. Le raccourci hydratation utilise les paramètres d’URL Next.js avec Suspense ; son ouverture directe est vérifiée sans échec de rendu ni erreur console.
- Export réel : quatre carnets fictifs, rituels, validations et souvenir inclus ; réponse privée sans cache. Accès entre comptes et rôle lecture seule contrôlés via les API locales.

Les parcours authentifiés utilisent uniquement des comptes et des bases locales fictifs. Les contrôles de production sont en lecture seule ; aucun compte de test distant n’a été créé. Les appels IA payants et les transports réels de notifications ne sont pas exécutés dans ces tests.

## Mise en service

Cible vérifiée : dépôt `kadriissam365-ops/mama-track`, projet Vercel `pregnancy-tracker` (`prj_FvRlp4ycd8LzPmeYaaMDU74uvQDX`), domaine `mamatrack.fr`, projet Supabase `xddutehapskhgrgimpme`.

La migration additive `supabase/migrations/20261006_child_routines.sql` est appliquée le 6 octobre 2026 à MamaTrack. Les deux nouvelles tables ont chacune trois politiques d’accès ; aucune lecture anonyme ni modification de l’auteur par les clients authentifiés n’est accordée. Aucune table grossesse, carnet existant ou base BabyTrack n’est remplacée.

## Illustration originale

Fichier déployé : `public/art/family-world.webp` (1122 × 1402, environ 215 Ko). Image créée avec Imagegen, puis conversion WebP pour le site. Icônes de marque créées séparément en SVG.

Prompt exact :

```text
Use case: stylized-concept. Asset type: original editorial hero artwork for MamaTrack, a refined French family app from pregnancy to children aged six. Create a beautiful warm sculptural paper-and-ceramic still life, not a UI mockup. A softly glowing terracotta sun, a sage-green arch sheltering a tiny ivory baby bassinet with quilt, a wooden crescent moon and a small peach hot-air balloon, a few lush sculptural sage leaves and rounded play blocks suggesting childhood. Visual story of welcoming a baby and growing together. Sophisticated tactile clay/papercraft forms with realistic delicate shadows and linen texture, calm joyful premium editorial art direction. Cream/oat background #f8f5ed, forest green #274c40, muted sage #a8bba5, warm peach #efb49a and terracotta #c16f50. Composition portrait 4:5, major forms centered with generous breathable space, natural morning light from top left. No faces, no people, no letters, no text, no brand logos, no watermark, no phone frames. The result should feel like an enchanting boutique children's museum installation photographed in a studio, tasteful and wonderfully tangible.
```

## Incident indépendant déjà identifié

La clé secrète et le mot de passe de base BabyTrack publiés dans un ancien fichier restent à renouveler. Aucune rotation n'est supposée réalisée sans preuve.

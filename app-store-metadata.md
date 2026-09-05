# MamaTrack — App Store metadata (FR)

À copier-coller dans App Store Connect → MamaTrack → Distribution → onglet 1.0 → Informations sur la version.

---

## Nom de l'app
`MamaTrack`
(maximum 30 caractères — actuel : 9 ✓)

## Sous-titre
`Compagnon de grossesse`
(maximum 30 caractères — actuel : 22 ✓)

## Texte promotionnel
*(170 caractères max — modifiable sans nouvelle review)*

```
Votre compagnon de grossesse, semaine après semaine. Suivi bébé, contractions, agenda & rappels, journal photo, projet naissance — sans pub.
```

## Description
*(4000 caractères max)*

```
MamaTrack est l'application française qui vous accompagne du test positif jusqu'à la naissance de votre bébé.

Pensée par et pour les futures mamans, MamaTrack rassemble tout ce dont vous avez besoin pendant les 9 mois de grossesse, dans une seule interface douce, claire et sans publicité.

— INFORMATION IMPORTANTE —
MamaTrack est un compagnon de grossesse et un journal de bien-être. Ce n'est pas un dispositif médical : l'application ne fournit ni diagnostic, ni conseil médical, ni traitement, et ne remplace en aucun cas le suivi de votre médecin, de votre sage-femme ou de votre maternité. Les contenus informatifs s'appuient sur des sources publiques officielles (HAS, Assurance Maladie, ANSES, OMS), citées dans l'app. Pour toute question concernant votre santé ou celle de votre bébé, consultez un professionnel de santé. En cas d'urgence, appelez le 15.

— SUIVI BÉBÉ SEMAINE PAR SEMAINE —
Découvrez chaque semaine la taille, le poids et l'évolution de votre bébé, accompagnés de conseils personnalisés. Le calcul peut se faire en semaines d'aménorrhée (SA) ou en grossesse (GA), parfait pour les parcours classiques comme pour les FIV/PMA.

— 10+ TRACKERS BIEN-ÊTRE —
Poids, hydratation, humeur, sommeil, tour de ventre, activité… Notez votre quotidien dans votre journal personnel et visualisez votre évolution avec des courbes claires.

— CHRONO CONTRACTIONS —
Minuteur précis avec historique, durée et fréquence en temps réel. Indispensable au moment du travail.

— AGENDA & RAPPELS —
Tous vos rendez-vous importants regroupés au même endroit et rappelés automatiquement.

— JOURNAL PHOTO BUMP —
Capturez chaque mois l'évolution de votre ventre, ajoutez des notes et créez la galerie souvenir de votre grossesse.

— PROJET NAISSANCE PDF —
Construisez votre projet de naissance en quelques minutes et exportez-le en PDF pour le remettre à l'équipe médicale.

— 250+ PRÉNOMS —
Explorez et sauvegardez vos prénoms favoris filtrés par origine, genre et popularité.

— MODE DUO —
Partagez votre suivi avec le futur papa ou votre famille — chacun reçoit les mises à jour en temps réel et peut vous envoyer des messages d'encouragement.

— GUIDES PRATIQUES —
Alimentation, activité douce, FAQ, numéros utiles : des contenus informatifs clairs qui s'appuient sur les recommandations publiques officielles, avec sources citées dans l'app. MamaTrack ne fournit pas de conseil médical — pour toute question de santé, rapprochez-vous de votre professionnel de suivi.

— MAMACOACH, COMPAGNON BIEN-ÊTRE (OPTIONNEL) —
Des idées pour mieux dormir, mieux manger ou préparer la valise maternité, rédigées par une intelligence artificielle. MamaCoach ne s'active qu'après votre accord explicite dans l'app, peut être coupé à tout moment depuis les réglages, et ne donne jamais d'avis médical.

— LISTE D'ACHATS BÉBÉ —
Cochez la valise maternité et préparez l'arrivée de bébé sans rien oublier.

— RAPPELS INTELLIGENTS —
Hydratation, mouvements bébé, vitamines — recevez des notifications personnalisées que vous pouvez désactiver à tout moment.

— PRIVÉ ET SÉCURISÉ —
Vos données restent à vous : chiffrées, hébergées en Europe, jamais revendues. Conformité RGPD complète.

— 100 % GRATUIT, SANS PUB —
Toutes les fonctionnalités essentielles sont accessibles dès l'inscription. Pas de paywall caché. Pas de bannière publicitaire.

MamaTrack a été conçu en France, par une équipe à l'écoute des futures mamans. Nous écoutons chaque retour pour améliorer l'app à chaque grossesse.

Bienvenue dans une grossesse plus sereine, plus organisée, et mieux entourée.

Rappel : MamaTrack ne remplace pas un avis médical. Consultez toujours votre médecin ou votre sage-femme.
```

> ℹ️ Pas d'emoji dans la description : App Store Connect refuse le ❤️ (erreur API constatée le 2026-07-19). La section « INFORMATION IMPORTANTE » et le rappel final répondent au motif 1.4.1 du rejet #2 (2026-07-20) : disclaimer médical explicite exigé dans la fiche App Store.

## Mots-clés
*(100 caractères max, séparés par virgules)*

```
grossesse,enceinte,bébé,maternité,contractions,suivi,calendrier,naissance,bien-être,journal
```
*(actuel : 91 caractères ✓)*

## URL d'assistance
```
https://mamatrack.fr/contact
```

## URL marketing (optionnel)
```
https://mamatrack.fr
```

## URL de la politique de confidentialité
```
https://mamatrack.fr/confidentialite
```

## Catégorie
- **Principale** : `Style de vie` (Lifestyle)
- **Secondaire** : `Forme et santé` (Health & Fitness)

> ⚠ Changé depuis le rejet 5.1.1(ix) du 2026-05-19 : l'ancienne catégorie principale `Médecine` classait l'app comme service de santé, réservé aux comptes Organization. Le repositionnement bien-être/lifestyle (option B) impose Style de vie en principale.

## Classification d'âge
- `4+` (aucun contenu sensible — la nudité médicale d'illustration reste sous le seuil 9+)

## Licence d'utilisation finale (EULA)
Standard Apple (laisser le champ vide).

## Informations de contact (Reviewer)
- **Prénom** : Issam
- **Nom** : Kadri
- **Numéro de téléphone** : (à remplir)
- **E-mail** : kadriissam365@gmail.com
- **Notes pour la review** :

```
MamaTrack est une PWA Next.js déployée sur https://mamatrack.fr et embarquée
dans une WebView Capacitor pour iOS.

Comptes de test :
- Email : kadriissam365+reviewer@gmail.com
- Mot de passe : MamaReview2026!Apple

L'application charge le contenu depuis https://mamatrack.fr (production
Vercel + base Supabase). Pas de fonctionnalité d'achat in-app dans cette
version. La fonctionnalité Premium n'est pas exposée sur la build iOS
(conformité §3.1.1).

Données collectées : email, profil grossesse (date prévue, prénom mère/bébé),
journal personnel (poids, humeur, eau, sommeil), photos bump,
contractions, rendez-vous, prénoms favoris. Aucune publicité, aucun tracker
tiers. RGPD Europe. Hébergement Supabase Frankfurt + Vercel global edge.

Permissions iOS demandées :
- Camera (NSCameraUsageDescription) : pour ajouter photos bump (journal photo)
- Photo Library (NS{Photo,PhotoAdd}LibraryUsageDescription) : import et export photos
- Notifications : rappels hydratation, mouvements bébé, vitamines (opt-in)

Merci pour votre review !
```

## Version 1.0 — Nouveautés (notes de version)
*(4000 caractères max)*

```
Bienvenue dans la première version de MamaTrack ! 💖

Ce que vous trouverez dans cette release :
- Suivi de grossesse semaine par semaine (SA et GA, FIV/PMA inclus)
- 10+ trackers bien-être personnalisés
- Chrono contractions précis
- Agenda & rappels intelligents
- Journal photo bump
- Projet de naissance exportable en PDF
- 250+ prénoms à explorer
- Mode duo pour partager avec votre partenaire
- Communauté anonyme pour échanger
- Mode sombre et offline

Vos retours nous aident à grandir. Écrivez-nous à kadriissam365@gmail.com — chaque message est lu. 🌸
```

---

## Checklist avant submission

- [ ] Screenshots 6.7" iPhone (1290×2796) — au moins 3, jusqu'à 10 (fichier généré par script)
- [ ] Screenshots 5.5" iPhone (1242×2208) — au moins 3, jusqu'à 10 (optionnel si 6.7" présents)
- [ ] Icône 1024×1024 (déjà uploadée via Xcode build)
- [ ] Politique de confidentialité accessible publiquement (https://mamatrack.fr/confidentialite ✓)
- [ ] Mentions légales accessibles (https://mamatrack.fr/mentions-legales ✓)
- [ ] CGU accessibles (https://mamatrack.fr/cgu ✓)
- [ ] Compte de test reviewer créé dans Supabase
- [ ] App Privacy details remplis (cf. asc-privacy.md)
- [ ] Age rating questionnaire complété
- [ ] Conformité chiffrement répondue (false — `ITSAppUsesNonExemptEncryption` déjà false dans Info.plist)
- [ ] Build 1.0(1) sélectionné dans la version 1.0

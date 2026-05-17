# MamaTrack — Google Play Console metadata (FR)

À copier-coller dans Play Console → MamaTrack → "Présence sur le Play Store" → onglet "Présentation principale".

---

## Nom de l'application
`MamaTrack`
*(max 30 caractères — actuel : 9 ✓)*

## Description courte (Short description)
*(max 80 caractères)*

```
Suivi de grossesse semaine par semaine, complet et sans publicité.
```
*(actuel : 64 caractères ✓)*

## Description complète (Full description)
*(max 4000 caractères)*

```
MamaTrack est l'application française qui vous accompagne du test positif jusqu'à la naissance de votre bébé.

Pensée par et pour les futures mamans, MamaTrack rassemble tout ce dont vous avez besoin pendant les 9 mois de grossesse, dans une seule interface douce, claire et sans publicité.

🤰 SUIVI BÉBÉ SEMAINE PAR SEMAINE
Découvrez chaque semaine la taille, le poids et l'évolution de votre bébé, accompagnés de conseils personnalisés. Le calcul peut se faire en semaines d'aménorrhée (SA) ou en grossesse (GA), parfait pour les parcours classiques comme pour les FIV/PMA.

📊 10+ TRACKERS SANTÉ
Poids, hydratation, symptômes, humeur, tension artérielle, sommeil, tour de ventre, exercices… Visualisez votre évolution avec des courbes claires et identifiez les signaux faibles.

⏱️ CHRONO CONTRACTIONS
Minuteur précis avec historique, durée et fréquence en temps réel. Indispensable au moment du travail.

📅 AGENDA MÉDICAL
Tous vos rendez-vous (gynéco, échographies, prises de sang, sage-femme) regroupés et rappelés automatiquement.

📷 JOURNAL PHOTO BUMP
Capturez chaque mois l'évolution de votre ventre, ajoutez des notes et créez la galerie souvenir de votre grossesse.

📄 PROJET NAISSANCE PDF
Construisez votre projet de naissance en quelques minutes et exportez-le en PDF pour le remettre à l'équipe médicale.

💛 250+ PRÉNOMS
Explorez et sauvegardez vos prénoms favoris filtrés par origine, genre et popularité.

👫 MODE DUO
Partagez votre suivi avec le futur papa, votre sage-femme ou votre famille — chacun reçoit les mises à jour en temps réel et peut vous envoyer des messages d'encouragement.

📚 GUIDES VALIDÉS
Alimentation autorisée/interdite, exercices recommandés, FAQ, signaux d'alerte, urgences : tous les contenus sont validés par des professionnels de santé.

🛒 LISTE D'ACHATS BÉBÉ
Cochez la valise maternité et préparez l'arrivée de bébé sans rien oublier.

🔔 RAPPELS INTELLIGENTS
Hydratation, mouvements bébé, prise de médicaments — recevez des notifications personnalisées que vous pouvez désactiver à tout moment.

🤖 MAMACOACH IA (Premium)
Assistant sage-femme IA 24/7 et analyses d'images intelligentes pour vos échographies, ordonnances et prises de sang.

🔒 PRIVÉ ET SÉCURISÉ
Vos données restent à vous : chiffrées, hébergées en Europe, jamais revendues. Conformité RGPD complète.

💝 SANS PUBLICITÉ
L'essentiel du suivi de grossesse est gratuit dès l'inscription. Pas de bannières publicitaires.

MamaTrack a été conçu en France, par une équipe à l'écoute des futures mamans. Nous écoutons chaque retour pour améliorer l'app à chaque grossesse.

Bienvenue dans une grossesse plus sereine, plus organisée, et mieux entourée. ❤️
```

## Quoi de neuf (Release notes 1.0)
*(max 500 caractères)*

```
Bienvenue dans MamaTrack 💖

✨ Suivi de grossesse semaine par semaine (SA et GA, FIV/PMA inclus)
✨ 10+ trackers santé personnalisés
✨ Chrono contractions précis
✨ Agenda médical avec rappels
✨ Journal photo bump
✨ Projet de naissance PDF
✨ 250+ prénoms
✨ Mode duo pour partager
✨ Communauté anonyme
✨ MamaCoach IA (Premium)
✨ Mode sombre + offline

Écrivez-nous à kadriissam365@gmail.com — chaque message est lu. 🌸
```

---

## Catégorisation

| Champ | Valeur |
|---|---|
| Type d'application | App (pas Game) |
| Catégorie | **Santé et forme** (Health & Fitness) |
| Tags (jusqu'à 5) | Grossesse, Santé, Maternité, Bébé, FIV |

## Coordonnées du développeur

| Champ | Valeur |
|---|---|
| Adresse e-mail | `kadriissam365@gmail.com` |
| Téléphone | *(à renseigner — Google le demande)* |
| Site Web | `https://mamatrack.fr` |
| Politique de confidentialité | `https://mamatrack.fr/confidentialite` |

---

## Ressources graphiques requises (Play Store)

| Élément | Format | Statut |
|---|---|---|
| **Icône** | 512×512 PNG 32 bits avec alpha | À générer depuis l'icône iOS |
| **Image principale (Feature graphic)** | 1024×500 PNG/JPG | À créer (bannière marketing) |
| **Captures d'écran téléphone** | min 2, max 8 — 1080×1920+ portrait | `build/appstore-screenshots/android-phone/` (à générer) |
| **Captures 7" tablet** (optionnel) | min 1, max 8 — 1200×1920+ | Non requis pour MVP |
| **Captures 10" tablet** (optionnel) | min 1, max 8 — 1920×1200+ | Non requis pour MVP |

→ Script Android : `node scripts/screenshot-playstore.mjs` (à venir).

---

## Public cible et contenu

- **Tranche d'âge** : 18+ (médecine/santé reproductive)
- **App accessible aux enfants ?** : NON (réponds NON à la question "designed for children under 13")
- **Apps Family ?** : NON

## Tarification et distribution

- **Prix** : Gratuit
- **Pays** : France + francophonie (Belgique, Suisse, Luxembourg, Monaco, Canada, Maroc, Tunisie, Algérie, Sénégal, Côte d'Ivoire, Cameroun) OU "Tous les pays"
- **Contient des publicités ?** : NON
- **Permet les achats intégrés ?** : Pas pour v1.0 (MamaCoach Premium via Stripe web seulement pour l'instant)

---

## Notes de release (à coller dans `Production → Créer une version`)

Reprends le bloc "Quoi de neuf" ci-dessus.

---

## Checklist avant publication

- [ ] Compte développeur Google Play vérifié (identité + téléphone)
- [ ] Icône 512×512 uploadée
- [ ] Image principale 1024×500 uploadée
- [ ] Au moins 2 screenshots téléphone
- [ ] Description courte + complète remplies
- [ ] Catégorie sélectionnée (Santé et forme)
- [ ] Politique de confidentialité URL valide
- [ ] Email contact dev renseigné
- [ ] **Sécurité des données** (Data Safety) rempli — cf. `play-data-safety.md`
- [ ] **Classification du contenu** (Content Rating) questionnaire complété → PEGI 3 visé
- [ ] **Public cible** : 18+
- [ ] **Pays/régions** sélectionnés
- [ ] **AAB** uploadé dans Production (ou Test fermé d'abord)

# MamaTrack — App Privacy & Age Rating templates

À reporter dans App Store Connect → MamaTrack → onglet `Confidentialité de l'app` et le questionnaire `Classification d'âge`.

---

## 1. Confidentialité de l'app (App Privacy)

### Question d'entrée
> Cette app collecte-t-elle des données ?
- **Réponse** : OUI

### Catégories de données à déclarer

#### Coordonnées
- **E-mail** : ✅ Collecté
  - Utilisé pour : Fonctionnalité de l'app (auth Supabase)
  - Lié à l'identité de l'utilisateur : OUI
  - Utilisé pour le suivi : NON

#### Données utilisateur
- **Autres données utilisateur** (prénom mère/bébé, date prévue d'accouchement, mode SA/GA) : ✅ Collecté
  - Utilisé pour : Fonctionnalité de l'app
  - Lié à l'identité : OUI
  - Suivi : NON

#### Données médicales et de santé
- **Données médicales (poids, symptômes, humeur, sommeil, tension, contractions, médicaments, mouvements bébé, contractions, hydratation, nutrition, exercices, mesures abdominales, projet de naissance)** : ✅ Collecté
  - Utilisé pour : Fonctionnalité de l'app, Statistiques (graphiques personnels)
  - Lié à l'identité : OUI
  - Suivi : NON

#### Photos ou vidéos
- **Photos** (journal bump, photos d'échographies, photos d'ordonnances) : ✅ Collecté
  - Utilisé pour : Fonctionnalité de l'app
  - Lié à l'identité : OUI
  - Suivi : NON

#### Identifiants
- **Identifiant utilisateur** (UUID Supabase) : ✅ Collecté
  - Utilisé pour : Fonctionnalité de l'app, Authentification
  - Lié à l'identité : OUI
  - Suivi : NON

#### Diagnostics
- **Aucun** — pas de SDK analytics tiers (pas de Firebase, pas de Sentry public, pas de Mixpanel)

### Données NON collectées (cocher Non)
- Localisation
- Informations financières
- Coordonnées de paiement
- Historique de recherche
- Historique de navigation
- Identifiants publicitaires
- Données interactives
- Informations sensibles (orientation politique, religion, syndicat, etc.)
- Contacts
- Données d'utilisation (analyse de produit)
- Audio
- Jeux

### Suivi (Tracking)
> Utilisez-vous des données pour suivre les utilisateurs sur les apps et sites web d'autres entreprises ?
- **Réponse** : NON

---

## 2. Classification d'âge (Age Rating)

App Store Connect → Distribution → Informations sur l'app → **Modifier** la classification d'âge.

### Réponses au questionnaire

| Question | Réponse |
|---|---|
| Contenu cartoon ou de fantasy violent | Aucun |
| Violence réaliste | Aucun |
| Violence sanglante et sadique réaliste | Aucun |
| Thèmes sexuels ou nudité grave/explicite | Aucun |
| Profanation ou humour grossier | Aucun |
| Références à l'alcool, au tabac ou à la drogue | Aucun |
| Maturité/Suggestif | Aucun |
| Horreur/Peur | Aucun |
| Médical/Traitement médical informatif | **Peu fréquent** *(guides nutritionnels, FAQ médicale, médicaments grossesse — informatif uniquement, ne remplace pas l'avis médical)* |
| Pari ou jeux d'argent | Aucun |
| Contenu généré par les utilisateurs sans modération | **Peu fréquent** *(forum communautaire avec modération a priori)* |
| Accès Internet sans restriction | NON *(URLs limitées au domaine mamatrack.fr et à Supabase)* |

### Résultat attendu
- **Classification finale** : 4+

---

## 3. Conformité chiffrement (Encryption)

App Store Connect → Distribution → Build 1.0(1) → Onglet **Chiffrement**.

> Votre app utilise-t-elle des algorithmes de chiffrement ?
- **Réponse** : OUI *(HTTPS standard)*

> Votre app utilise-t-elle uniquement du chiffrement standard fourni par iOS/macOS, ou est-elle exemptée ?
- **Réponse** : OUI, exempté

> Votre app est-elle disponible sur les territoires US ?
- **Réponse** : OUI

**Note** : `ITSAppUsesNonExemptEncryption=false` est déjà défini dans `ios/App/App/Info.plist`, donc Apple n'affichera probablement pas ce questionnaire à chaque build.

---

## 4. Texte politique de confidentialité (référence rapide)

URL publique : https://mamatrack.fr/confidentialite (déjà en ligne ✓)

Champs requis dans ASC :
- **URL Politique de confidentialité** : `https://mamatrack.fr/confidentialite`
- **URL Conditions d'utilisation (EULA)** : *(laisser vide → utilise EULA Apple standard)*

---

## 5. Compte de test pour le reviewer Apple

À créer dans Supabase ou via le formulaire d'inscription, puis renseigner dans App Store Connect → Distribution → Informations sur la version → **Connexion requise**.

### Données suggérées
- **Nom d'utilisateur** : `reviewer-apple@mamatrack.fr`
- **Mot de passe** : générer un mot de passe aléatoire (16 caractères, minuscules+majuscules+chiffres+symboles)

### Préparer un compte démo avec données réalistes
1. Inscription via /auth/signup avec l'email reviewer
2. Ajouter dans le profil :
   - DPA (date prévue d'accouchement) : 2026-08-15 *(soit ~3 mois dans le futur)*
   - Prénom mère : "Reviewer"
   - Prénom bébé : "Demo"
3. Ajouter quelques données de démo :
   - 3 entrées de poids
   - 2 rendez-vous médicaux dans l'agenda
   - 1 photo bump (placeholder)
   - 5 prénoms favoris
   - 1 entrée journal

Ainsi le reviewer voit un compte vivant et comprend le périmètre de l'app.

---

## 6. Checklist finale ASC avant submission

- [ ] **App Privacy** rempli (cf. section 1)
- [ ] **Age Rating** rempli → 4+
- [ ] **Encryption** : `ITSAppUsesNonExemptEncryption=false` ✓
- [ ] **Politique de confidentialité URL** : https://mamatrack.fr/confidentialite ✓
- [ ] **Compte de test reviewer** créé + identifiants renseignés dans la version
- [ ] **Notes pour le reviewer** : copier le bloc de `app-store-metadata.md`
- [ ] **Build 1.0(1)** sélectionné dans la version
- [ ] **Screenshots 6.7"** uploadés (au moins 3, fichiers dans `build/appstore-screenshots/6.7/`)
- [ ] **Description, mots-clés, sous-titre, texte promo** copiés depuis `app-store-metadata.md`
- [ ] Bouton **Soumettre pour examen** vert

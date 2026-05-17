# MamaTrack — Google Play Data Safety + Content Rating templates

À reporter dans Play Console → MamaTrack :
- **Sécurité des données** : Politique → Sécurité des données
- **Classification du contenu** : Politique → Classification du contenu

---

## 1. Sécurité des données (Data Safety form)

### Question d'entrée
> Votre application collecte-t-elle ou partage-t-elle l'un des types de données suivants ?
- **Réponse** : OUI

### Question chiffrement
> Les données collectées sont-elles chiffrées en transit ?
- **Réponse** : OUI *(HTTPS Supabase + Vercel TLS 1.3)*

### Question suppression
> Fournissez-vous une méthode permettant à l'utilisateur de demander la suppression de ses données ?
- **Réponse** : OUI *(via /settings → Supprimer mon compte, ou par email à kadriissam365@gmail.com)*

### Conformité Play Families
- **App principalement destinée aux enfants (<13 ans)** : NON

---

### Catégories à déclarer (toutes : collectées, requises pour la fonctionnalité de l'app, NON partagées avec des tiers)

| Catégorie / Type | Collecté ? | Partagé ? | Requis / Optionnel | Finalité |
|---|---|---|---|---|
| **Informations personnelles → Adresse e-mail** | OUI | NON | Requis | Authentification du compte |
| **Informations personnelles → Identifiants utilisateur** (UUID Supabase) | OUI | NON | Requis | Fonctionnalité de l'app, Authentification |
| **Informations personnelles → Autres informations** (prénom maman, prénom bébé) | OUI | NON | Optionnel | Personnalisation, Fonctionnalité |
| **Activité dans l'application → Autre activité** (DPA, mode SA/GA, profil grossesse) | OUI | NON | Requis | Fonctionnalité |
| **Informations sur la santé et la condition physique → Informations sur la santé** | OUI | NON | Optionnel | Fonctionnalité, Statistiques (graphiques personnels) |
|     ↳ Poids, symptômes, humeur, hydratation, nutrition, sommeil, tension artérielle, contractions, mouvements bébé, médicaments, tour de ventre, exercices, projet naissance | | | | |
| **Photos et vidéos → Photos** (journal bump, photos d'échographies, ordonnances) | OUI | NON | Optionnel | Fonctionnalité |
| **Messages → Autres messages dans l'application** (chat duo) | OUI | NON | Optionnel | Fonctionnalité (mode duo) |

### Catégories à NE PAS cocher
- Adresse postale, téléphone, race/origine ethnique, orientation politique/sexuelle, religion
- Informations financières (compte bancaire, carte de crédit, achats)
- Localisation (précise ou approximative)
- Contacts
- Historique de recherche dans l'app
- Historique de navigation Web
- Fichiers et docs
- Calendrier
- Audio (enregistrements vocaux, fichiers son)
- ID d'appareil ou autres ID
- Diagnostics (crashes, performance)
- Données publicitaires / IDFA / AAID
- Données sensibles (biométrie, médicales sensibles type SIDA/avortement → NON, on collecte juste du suivi grossesse standard)

### Pratiques de sécurité supplémentaires
- ✅ Les données sont chiffrées en transit (HTTPS partout)
- ✅ Les utilisateurs peuvent demander la suppression de leurs données
- ✅ Engagement à respecter Google Play Families Policy : N/A (app 18+)

---

## 2. Classification du contenu (Content Rating)

Play Console → Politique → Classification du contenu → "Démarrer le questionnaire IARC".

### Section App ou Jeu
- **Type** : App
- **Catégorie principale** : Reference, News, or Educational

### Questionnaire IARC

| Question | Réponse |
|---|---|
| Contenu violent (cartoon ou réel) | **NON** |
| Activité sexuelle, nudité, contenu romantique | **NON** *(suivi de grossesse uniquement, illustrations médicales neutres)* |
| Profanité, blasphème, langage grossier | **NON** |
| Contrôlé : drogue / alcool / tabac | **NON** |
| Jeux d'argent, jeux de hasard | **NON** |
| Contenu fait peur ou choquant | **NON** *(quelques mentions cliniques sur urgences obstétricales, contextualisées)* |
| Permet aux utilisateurs d'interagir ou d'échanger | **OUI** *(mode duo + forum communautaire — modération a priori en place)* |
| Partage la position géographique | **NON** |
| Permet l'achat d'objets virtuels | **NON** *(Premium via Stripe web pour l'instant, pas d'IAP)* |
| Permet aux utilisateurs d'acheter des biens physiques | **NON** |
| Donne accès à un contenu généré par d'autres utilisateurs et non filtré | **NON** *(modération a priori)* |
| Affiche des comptes pour rester en contact | **NON** |

### Résultat attendu
- **PEGI** : 3 (Tout public)
- **ESRB** : Everyone
- **USK** : 0+
- **Apple** *(rappel App Store)* : 4+

### Disclaimer médical (à inclure dans description si demandé)
*"MamaTrack fournit des informations à but informatif uniquement et ne se substitue pas à un avis médical professionnel. Consultez toujours votre médecin, sage-femme ou gynécologue pour toute décision liée à votre grossesse."*

→ Ce disclaimer est déjà présent dans `/conseils`, `/urgences`, et la politique de confidentialité.

---

## 3. Public cible (Target audience)

Play Console → Politique → Public cible et contenu.

- **Tranches d'âge cibles** : 18 et plus
- **App d'intérêt pour les enfants ?** : NON
- **Comportements similaires aux apps Family ?** : NON
- Si Google demande pourquoi 18+ : "App destinée aux femmes enceintes et à leur entourage adulte. Contenu médical informatif sur la grossesse, l'accouchement et la santé maternelle."

---

## 4. Annonces / Achats intégrés

| Champ | Réponse v1.0 |
|---|---|
| Cette app contient-elle des annonces ? | **NON** |
| Cette app contient-elle des achats intégrés ? | **NON** *(le Premium MamaCoach IA passe par Stripe web pour l'instant — pas via Google Play Billing)* |

> ⚠ Note : si tu actives plus tard le Premium via Google Play Billing (recommandé pour respecter Google Play Billing Policy), il faudra cocher OUI ici.

---

## 5. Politique d'app (App Policy / Permissions justification)

### Permissions Android sensibles à justifier

| Permission | Justification |
|---|---|
| `INTERNET` | Synchronisation Supabase + push notifications |
| `RECEIVE_BOOT_COMPLETED` | Re-programmer les rappels après reboot (notifications de prise de médicaments, mouvements bébé) |
| `POST_NOTIFICATIONS` | Rappels personnalisés opt-in (hydratation, médicaments, mouvements bébé) |
| `READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` | Import de photos pour journal bump et échographies |
| `CAMERA` | Prise de photos directe pour journal bump / scan ordonnance |
| `VIBRATE` | Feedback haptique chrono contractions |

### Sensitive permissions declarations
- Pas de `SYSTEM_ALERT_WINDOW`, `READ_PHONE_STATE`, `ACCESS_FINE_LOCATION`, `READ_CONTACTS`, `READ_SMS`, `MANAGE_EXTERNAL_STORAGE` → aucun questionnaire de justification spécial requis.
- Pas d'usage Accessibilité.
- Pas d'usage Foreground Services en arrière-plan persistant (les notifications passent par WorkManager + AlarmManager standard, pas de service permanent).

---

## 6. Checklist finale Play Console avant publication

- [ ] Compte développeur vérifié (identité Google ID + téléphone)
- [ ] App créée dans Play Console (fr.mamatrack.app)
- [ ] **Sécurité des données** soumise et publiée
- [ ] **Classification du contenu** : questionnaire IARC validé → PEGI 3
- [ ] **Public cible** : 18+
- [ ] **Politique de confidentialité URL** : https://mamatrack.fr/confidentialite ✓
- [ ] **Annonces** : Non
- [ ] **Achats intégrés** : Non
- [ ] AAB uploadé dans un canal (Test interne → Test fermé → Production)
- [ ] Description courte + complète remplies (cf. `google-play-metadata.md`)
- [ ] Icône 512×512 + Feature graphic 1024×500 uploadés
- [ ] Au moins 2 screenshots téléphone (depuis `build/appstore-screenshots/android-phone/` une fois généré)
- [ ] Pays sélectionnés (France + francophonie ou Tous)
- [ ] Email contact dev renseigné
- [ ] Bouton **Examiner la version** vert → **Mettre en production**

# MamaTrack — grossesse, naissance et premières années

## Version préparée le 2 octobre 2026

Le dépôt principal est `kadriissam365-ops/mama-track`, branche `codex/mamatrack-unified-family`. La cible existante est Vercel `pregnancy-tracker` (`mamatrack.fr`) et Supabase `xddutehapskhgrgimpme`. L’ancien BabyTrack reste sur son dépôt, Vercel `baby-track` (`babytrack.mamatrack.fr`) et Supabase `fjxoxdagmcsepmukosav`.

Le code réunit les deux parcours sous MamaTrack : choix initial de l’étape, espace grossesse conservé, enregistrement de la naissance, sélection de plusieurs enfants, repas, sommeil, couches, croissance, vaccination, santé, agenda, diversification, étapes du développement, journal, partage familial, rapports et partage temporaire avec un professionnel. La navigation, le compte et les réglages sont communs. Les options Premium utilisent les droits MamaTrack vérifiés côté serveur.

## Transfert des carnets existants

Depuis `/enfant/import`, un utilisateur connecté à MamaTrack authentifie également son compte BabyTrack. Les deux preuves de connexion sont nécessaires. Le serveur lit seulement les données permises par les règles de sécurité du compte source, sans clé administrateur BabyTrack. Les enfants dont ce compte est propriétaire, leurs dix types d’enregistrements et les photos du journal sont copiés. Les identifiants et dates restent conservés ; l’auteur d’origine est enregistré séparément. Les écritures SQL sont atomiques. Une nouvelle tentative ne remplace pas les modifications déjà réalisées dans MamaTrack.

Les comptes et données BabyTrack restent disponibles à leur emplacement d’origine. Les comptes d’authentification ne sont pas fusionnés automatiquement. Les proches doivent recevoir une nouvelle invitation dans MamaTrack ; leurs anciens accès continuent sur BabyTrack. Les liens pédiatre existants restent sur leur domaine initial. Les abonnements Stripe BabyTrack ne sont pas modifiés ; l’audit du 2 octobre a trouvé zéro abonnement Stripe enregistré et zéro essai encore actif.

La configuration serveur MamaTrack doit inclure `BABYTRACK_SUPABASE_PUBLISHABLE_KEY`, avec la clé **publique** du projet source. Le fichier `.env.family.example` ne contient aucune valeur secrète. Les clés, mots de passe et jetons des utilisateurs ne doivent jamais être ajoutés dans Git.

## Sécurité et confidentialité

- Accès SQL par propriétaire ou membre accepté, avec distinction lecture seule / modification.
- Provenance des lignes et propriétaire non modifiables par les clients.
- Acceptation unique et atomique des invitations ; liens pédiatre expirables et révocables.
- Journaux d’envoi réservés au serveur ; adresse de notification issue de l’authentification.
- Consentement IA enregistré par compte et contrôlé par le serveur ; quotas validés en SQL, sans ouverture illimitée en cas de panne.
- Limites sur les corps JSON, vérification des redirections et des destinations Web Push.
- Photos privées et liens de consultation de cinq minutes ; suppression des médias lors de la suppression du compte.
- Aucun HTML authentifié ni réponse RSC conservé dans le cache hors connexion. La mise à jour du service worker purge les anciens caches.
- Next.js mis à jour en 16.3.6 ; audit npm complet, y compris les outils de développement, sans vulnérabilité signalée. Les versions de CLI Capacitor, Sharp et UUID de l’outil d’icônes sont explicitement remplacées par les versions corrigées ; son démarrage, le traitement d’une image et la génération d’identifiant Xcode ont été vérifiés.

## Vérifications réalisées

- 61 tests passent, dont les migrations exécutées dans un vrai moteur PostgreSQL isolé via PGlite : accès entre comptes, rôle lecture seule, invitations à usage unique, média privé, quota non contournable et transfert relançable sans écrasement.
- TypeScript et ESLint passent pour l’application unifiée.
- Compilation Next.js réussie avec Webpack. Turbopack rencontre une restriction locale sur ses ports internes ; aucun masquage des erreurs TypeScript n’est conservé.
- Vérification Playwright de l’accueil à 390 px, du lien de connexion depuis une invitation, des redirections protégées et des réponses 401 des API et tâches internes sans authentification.
- BabyTrack : erreurs TypeScript existantes corrigées et compilation Webpack vérifiée.

La validation des parcours authentifiés sur une base Supabase de staging et le transfert réel d’un compte n’ont **pas encore été réalisés**. Les tests PostgreSQL utilisent des identités fictives et ne modifient aucune donnée de production.

## Mise en service — accord requis

**Aucune migration de production n’a été appliquée et aucun site n’a été publié pendant cette préparation.** La validation automatique a refusé l’application de la migration principale en raison de son impact sur plusieurs tables, règles d’accès, privilèges, triggers et stockage. Elle exige une autorisation explicite pour poursuivre.

Après accord, sauvegarder le schéma actuel, tester sur staging puis appliquer dans cet ordre :

1. MamaTrack : `20261002_unified_family.sql` — tables enfant, réglages, consentement, droits d’accès, stockage privé et colonne de conception manquante.
2. MamaTrack : `20261002_rate_limit_rules.sql` — quotas fixés côté serveur.
3. MamaTrack : `20261002_babytrack_import.sql` — transfert réservé au serveur.
4. BabyTrack : `20261002_security_hardening.sql` — journal de notifications privé, fonctions et champs privilégiés protégés.

Configurer les variables sur la bonne cible Vercel, vérifier les fonctions de rappel seulement si leurs transports sont configurés (SMTP et VAPID), et déployer d’abord une preview. Vérifier naissance, premier repas, sélection d’enfant, partage, révocation, export, suppression et import avant toute promotion sur `mamatrack.fr`.

Ne pas rediriger automatiquement l’ancien domaine avant le transfert des carnets et la vérification des anciens liens. Le changement d’URL de l’app native et la nouvelle soumission Apple restent une étape distincte.

## Secret BabyTrack exposé : traitement urgent restant

L’ancien `CLAUDE.md` public contenait une clé secrète Supabase et un mot de passe de base de données. Les valeurs ont été retirées du fichier actuel, mais demeurent dans l’historique Git. La clé exposée était encore acceptée par l’API lors de l’audit. Elle doit être révoquée/renouvelée, avec mise à jour des variables serveur BabyTrack et changement du mot de passe de base. Le retrait du fichier ne suffit pas.

L’accès à l’interface de gestion était bloqué par le verrouillage du Mac. Ne pas déclarer cet incident clos avant vérification de la révocation et du fonctionnement du service. Ne jamais recopier les anciennes valeurs dans un ticket, une description de commit ou une sortie d’outil.

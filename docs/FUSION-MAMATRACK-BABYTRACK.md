# MamaTrack — grossesse, naissance et premières années

## État du 4 octobre 2026

L’utilisateur a autorisé la mise en service le 4 octobre. Les trois migrations MamaTrack et le correctif SQL BabyTrack sont maintenant appliqués sur les projets identifiés ci-dessous. Les 20 profils MamaTrack ont conservé la même empreinte avant et après migration ; les 10 comptes et les deux carnets BabyTrack restent présents. La clé publique de transfert est configurée dans les trois environnements Vercel MamaTrack.

L’application unifiée est publiée sur `https://mamatrack.fr`. L’ancien site `https://babytrack.mamatrack.fr` reste accessible et affiche un lien vers le transfert des carnets dans MamaTrack. Les deux déploiements de production sont prêts. La rotation des secrets BabyTrack reste une intervention distincte nécessitant l’accès administrateur à Supabase.

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
- Photos privées et liens de consultation de cinq minutes ; affichage direct sans cache d’optimisation Next.js, nouveaux fichiers et imports avec durée de cache nulle ; suppression des médias lors de la suppression du compte.
- Aucun HTML authentifié ni réponse RSC conservé dans le cache hors connexion. La mise à jour du service worker purge les anciens caches.
- Next.js mis à jour en 16.3.6 ; audit npm complet, y compris les outils de développement, sans vulnérabilité signalée. Les versions de CLI Capacitor, Sharp et UUID de l’outil d’icônes sont explicitement remplacées par les versions corrigées ; son démarrage, le traitement d’une image et la génération d’identifiant Xcode ont été vérifiés.

## Vérifications réalisées

- 64 tests passent, dont les migrations exécutées dans un vrai moteur PostgreSQL isolé via PGlite : accès entre comptes, rôle lecture seule, invitations à usage unique, média privé, quota non contournable et transfert relançable sans écrasement. Les nouveaux contrôles couvrent aussi les chemins de photos et l’impossibilité d’utiliser une source de test en production.
- TypeScript et ESLint passent pour l’application unifiée.
- Compilation Next.js réussie avec Webpack. Turbopack rencontre une restriction locale sur ses ports internes ; aucun masquage des erreurs TypeScript n’est conservé.
- Vérification Playwright de l’accueil à 390 px, du lien de connexion depuis une invitation, des redirections protégées et des réponses 401 des API et tâches internes sans authentification.
- BabyTrack : erreurs TypeScript existantes corrigées et compilation Webpack vérifiée.
- Déploiements Vercel de production compilés avec Turbopack ; accueil, connexion et page hors connexion accessibles, API familiale renvoyant 401 sans session et espace enfant redirigeant vers la connexion. La page de connexion publiée ne présente aucune erreur console.

Une validation supplémentaire utilise deux piles Supabase locales complètes (Auth, PostgreSQL 17, PostgREST et Storage), avec les schémas actuels des deux projets et des comptes fictifs. Le navigateur mobile vérifie connexion, naissance, sauvegarde d’un biberon, transfert du carnet et de sa photo, puis retour au suivi grossesse. Les API vérifient les accès entre comptes, l’invitation unique, la lecture seule, l’export complet et la suppression du compte avec ses médias. Aucune donnée personnelle de production n’est copiée dans ces tests.

Le formulaire de grossesse met à jour le profil créé à l’inscription au lieu de demander un droit d’insertion supplémentaire. Le parcours complet en cinq étapes a enregistré la date prévue d’accouchement et réactivé l’espace grossesse en conservant les deux carnets fictifs. Les appels IA locaux renvoient 503, conformément à l’absence volontaire de clés de services payants dans cet environnement.

Un test supplémentaire avec création puis suppression d’un compte fictif en production a été refusé par la validation automatique, faute d’autorisation explicite pour cette mutation. Il n’a pas été exécuté ; les contrôles distants restent en lecture seule et les parcours authentifiés ont été vérifiés localement. Une demande d’autorisation distincte a été présentée à l’utilisateur.

Pour reproduire le transfert local, `BABYTRACK_LOCAL_TEST_URL` peut désigner une API Supabase sur `localhost` ou `127.0.0.1`. Cette variable est ignorée en production, où la source reste le projet BabyTrack vérifié.

## Migrations de mise en service

L’application initiale avait été refusée par la validation automatique en raison de son impact sur les tables et règles d’accès. Après l’accord explicite de l’utilisateur et les tests sur les copies locales des schémas, les quatre migrations ont réussi le 4 octobre.

Les états des schémas avant modification sont conservés localement hors Git. Ordre effectivement appliqué :

1. MamaTrack : `20261002_unified_family.sql` — tables enfant, réglages, consentement, droits d’accès, stockage privé et colonne de conception manquante.
2. MamaTrack : `20261002_rate_limit_rules.sql` — quotas fixés côté serveur.
3. MamaTrack : `20261002_babytrack_import.sql` — transfert réservé au serveur.
4. BabyTrack : `20261002_security_hardening.sql` — journal de notifications privé, fonctions et champs privilégiés protégés.

Les changements des deux dépôts sont commités et publiés sur leurs branches `main` respectives. Le déploiement MamaTrack validé a été promu sur `mamatrack.fr`, puis les mises à jour sont publiées par l’intégration Git Vercel. Les fonctions de rappel email ne sont activées que lorsque SMTP est configuré ; les notifications Web Push nécessitent VAPID. Les tests locaux n’utilisent pas les services payants d’IA ni les transports d’envoi réels.

Ne pas rediriger automatiquement l’ancien domaine avant le transfert des carnets et la vérification des anciens liens. Le changement d’URL de l’app native et la nouvelle soumission Apple restent une étape distincte.

## Secret BabyTrack exposé : traitement urgent restant

L’ancien `CLAUDE.md` public contenait une clé secrète Supabase et un mot de passe de base de données. Les valeurs ont été retirées du fichier actuel, mais demeurent dans l’historique Git. La clé exposée était encore acceptée par l’API lors de l’audit. Elle doit être révoquée/renouvelée, avec mise à jour des variables serveur BabyTrack et changement du mot de passe de base. Le retrait du fichier ne suffit pas.

La rotation n’est pas disponible avec les outils Supabase actuellement connectés ; un accès administrateur au tableau de bord a été demandé à l’utilisateur. Ne pas déclarer cet incident clos avant vérification de la révocation et du fonctionnement du service. Ne jamais recopier les anciennes valeurs dans un ticket, une description de commit ou une sortie d’outil.

# Conversion compte Apple Developer : Individual → Organization

Option choisie pour débloquer 5.1.1(ix) sur le rejet MamaTrack du 2026-05-19.
Délai total estimé : **3 à 6 semaines** (DUNS 1-5 j + Apple 2-4 sem).

---

## Pré-requis (à vérifier d'abord)

| Élément | Statut | Comment vérifier |
|---|---|---|
| **Personne morale immatriculée** (auto-entrepreneur, SASU, EURL, SARL…) | À confirmer | Avoir un n° SIREN/SIRET actif (KADRI AI ?) |
| **Représentant légal habilité à signer** | À confirmer | Toi-même si gérant/président |
| **Adresse de l'entreprise** | À confirmer | Adresse du siège social déclarée à l'INSEE |
| **Site web officiel** | ✅ | https://kadriai.com (ou https://mamatrack.fr) |
| **Email professionnel** | ✅ | kadriissam365@gmail.com (idéalement un email @kadriai.com) |
| **Numéro de téléphone professionnel** | À confirmer | Mobile ou fixe rattaché à l'entreprise |

> Si tu es **auto-entrepreneur**, ça passe → Apple accepte les "Sole Proprietorship". Tu n'as pas besoin d'une SAS/SARL. Mais il faut une **immatriculation officielle** (SIRET INSEE).

---

## Étape 1 — Demander un D-U-N-S Number (gratuit, 1-5 jours)

Le D-U-N-S est un identifiant unique géré par Dun & Bradstreet. Apple l'utilise comme preuve d'existence légale.

1. Va sur https://developer.apple.com/enroll/duns-lookup/
2. Choisis le pays : **France**
3. Renseigne :
   - **Legal Entity Name** : raison sociale exacte (ex: "KADRI AI" ou "Issam KADRI EI" pour entreprise individuelle)
   - **Adresse du siège** (telle qu'à l'INSEE / extrait Kbis)
   - **Téléphone**
   - **Email professionnel**
   - **Site web** (kadriai.com)
4. Clique sur "Look up your D-U-N-S Number"
   - Si un D-U-N-S existe déjà : il s'affiche, tu n'as plus rien à faire.
   - Si aucun trouvé : "Submit a request to receive a D-U-N-S Number" → Apple transmet la demande à D&B gratuitement.
5. **Délai** : 1 à 5 jours ouvrés. Tu reçois le numéro par email.

> ⚠ **Important** : les infos saisies doivent être **strictement identiques** à celles déclarées à l'INSEE/Kbis. Une majuscule mal placée ou une virgule en trop bloque le matching et fait perdre 1 semaine.

---

## Étape 2 — Demander la conversion à Apple Developer Support

Une fois le DUNS reçu, contacter Apple :

1. Va sur https://developer.apple.com/contact/
2. Choisis : **Membership** → **Account changes** → **Convert Individual account to Organization**
3. Renseigne :
   - **Apple ID** : kadriissam365@gmail.com
   - **Sujet** : "Convert Individual account to Organization for MamaTrack medical app submission"
   - **Description** : voir template ci-dessous

### Template de message à Apple

```
Hello Apple Developer Support,

I am the developer of the MamaTrack app (Bundle ID: fr.mamatrack.app, Apple ID: kadriissam365@gmail.com), currently enrolled in the Apple Developer Program as an Individual under my name Issam Kadri (Team ID: XY3HA7Y8HZ).

Our latest submission of MamaTrack (build 1.0(3), Submission ID f94fb4bd-e9ad-43cf-affb-fffd9cc3c7c8) was rejected under guideline 5.1.1(ix) which requires Organization enrollment for apps handling sensitive medical data. I would like to convert my Individual account to an Organization account to comply with this requirement.

Organization details:
- Legal entity name: [KADRI AI ou raison sociale exacte]
- Country: France
- Legal entity type: [Auto-entrepreneur / SASU / EURL / SARL]
- SIREN: [XXX XXX XXX]
- D-U-N-S Number: [reçu à l'étape 1]
- Business address: [adresse du siège]
- Phone: [numéro pro]
- Website: https://kadriai.com (ou mamatrack.fr)
- Email: kadriissam365@gmail.com

I am the legal signatory and have authority to bind the entity. Could you please initiate the conversion so I can resubmit MamaTrack to App Review?

Thank you,
Issam Kadri
```

---

## Étape 3 — Apple valide (2 à 4 semaines)

Apple Developer Support va :
1. Confirmer réception (sous 1-3 jours).
2. Vérifier l'identité du représentant légal (peut demander un Kbis, une CNI, un justificatif d'adresse).
3. Vérifier que le DUNS matche bien la legal entity name.
4. Convertir le compte (1-2 semaines après réception des justificatifs).
5. Email de confirmation : "Your account has been converted to Organization."

> Pendant cette période, **ton compte reste fonctionnel** pour les builds TestFlight, mais tu ne peux pas resoumettre à l'App Store Review (la version 1.0(3) reste en l'état "Refusé").

---

## Étape 4 — Resubmit MamaTrack 1.0(3)

Une fois la conversion confirmée :
1. App Store Connect → MamaTrack → version 1.0 (où le 1.0(3) attend déjà).
2. Vérifier que le compte affiche bien le nouveau nom légal en haut.
3. Cliquer "Resubmit for Review" en attachant le commentaire :

```
Hello App Review Team,

Following your feedback on submission f94fb4bd-e9ad-43cf-affb-fffd9cc3c7c8, our Apple Developer Program account has now been converted from Individual to Organization (Legal entity: [raison sociale], D-U-N-S [numéro], SIREN [numéro]), in compliance with guideline 5.1.1(ix).

Build 1.0(3) also addresses the other rejection points:
- 5.1.1(i) Privacy: an explicit AI consent gate now blocks all access to MamaCoach and the image scan features. The screen names Anthropic (Claude) and Google (Gemini), lists the exact data sent, and references our updated Privacy Policy section "Partage avec des services d'intelligence artificielle". The consent is revocable in Settings.
- 1.4.1 Safety: every page containing medical information (/conseils, /urgences, /alimentation) now displays a "Medical Sources" panel citing the French and international health authorities (HAS, Ameli, ANSES, ANSM, OMS, CRAT, CNGOF, INSERM, Santé Publique France).
- 2.1(b) Business model: the iOS build does NOT contain any IAP, paywall, subscription UI, or external payment flow. Premium MamaCoach is only accessible on mamatrack.fr web (Stripe). On iOS the `useIsIOSNative()` hook hides all premium UI and treats the user as Premium.

Reviewer test account: kadriissam365+reviewer@gmail.com / MamaReview2026!Apple

Thank you,
Issam Kadri
```

---

## Pendant l'attente (3-6 semaines)

Tu peux pousser **Android** en parallèle sans bloquer :
- Compte Google Play **Individual est accepté**, pas besoin d'org.
- Soumets MamaTrack sur Play Store internal test pendant qu'Apple traite la conversion.

---

## Checklist Issam

- [ ] Vérifier que KADRI AI / Issam Kadri EI a un SIRET actif (sur https://annuaire-entreprises.data.gouv.fr/)
- [ ] Étape 1 : demander le DUNS sur https://developer.apple.com/enroll/duns-lookup/
- [ ] Étape 2 : contacter Apple Developer Support avec le template ci-dessus
- [ ] Étape 3 : fournir Kbis/CNI à Apple si demandé
- [ ] Étape 4 : resubmit 1.0(3) une fois conversion confirmée

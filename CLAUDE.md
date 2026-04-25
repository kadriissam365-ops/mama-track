@AGENTS.md

# MamaTrack — Project Context for Claude Code

## What it is
PWA Next.js de suivi de grossesse — production live sur https://mamatrack.fr
Utilisatrice principale : Naïma (1ère grossesse). Objectif : app publique pour toutes les mamans.

## Stack
- **Framework :** Next.js 16.2.2 (App Router) + React 19.2 + TypeScript
- **Style :** Tailwind v4 + tw-animate-css + shadcn (base-ui/react)
- **State :** Zustand (`lib/store.ts`)
- **DB / Auth / Storage :** Supabase (projet dédié `xddutehapskhgrgimpme`)
- **Anim :** Framer Motion (chargé en lazy via `MotionProvider` + alias `m`)
- **PDF :** jsPDF + jspdf-autotable
- **Charts :** Recharts
- **Theme :** next-themes (dark mode actif)
- **Push :** web-push (VAPID)

## Repo & deploy
- **GitHub :** https://github.com/kadriissam365-ops/mama-track
- **Vercel project ID :** `prj_FvRlp4ycd8LzPmeYaaMDU74uvQDX`
- **Domaine prod :** https://mamatrack.fr (IONOS, acheté 2026-04-06)
- **Branche prod :** `main` (auto-deploy Vercel)
- **Build flag :** `typescript.ignoreBuildErrors: true` dans `next.config.ts` (évite OOM sur Vercel)

## Routes (28 pages actives)
dashboard `/` · `/baby` · `/tracking` · `/contractions` · `/agenda` · `/checklist` · `/duo` · `/journal` · `/prenoms` · `/naissance` · `/achats` · `/communaute` · `/conseils` · `/alimentation` · `/medicaments` · `/respiration` · `/urgences` · `/timeline` · `/bilan` · `/bump` · `/partner` · `/invite` · `/plus` · `/settings` · `/onboarding` · `/cgu` · `/mentions-legales` · `/confidentialite`

## Features v2 livrées
- Mode FIV/PMA (semaine SA vs GA, persisté)
- Dark mode (next-themes)
- Rappels intelligents + push notifications (VAPID)
- Bump diary (photos/notes/galerie)
- 250+ prénoms
- Projet naissance PDF (jsPDF)
- Liste achats
- Forum communautaire anonyme
- Chat duo (partenaire)
- Guides alim / sport / FAQ
- Mood + tension + abdomen tracker
- Nutrition tracker
- Offline banner (PWA)
- Service worker cache v8

## SMTP
Gmail App Password configuré côté Supabase (`kadriissam365@gmail.com` / app password `smcduwrfrbpqvxaj`). Emails de magic link / reset OK.

## ⚠️ State actuel (avril 2026)

### QA final : OK ✅ (24/04/2026)

### Travaux récents
1. **Sécurité audit** appliqué (cf. cycle kadriai.com pattern : DOMPurify, rate-limit, scan upload, CSP, etc. — vérifier `app/api/`).
2. **Perf — sprint 25 avril 2026** :
   - `4246f2b` — fusion phase 1+2 dans `loadAllUserData` (1 seul `Promise.all` au lieu de 2 vagues + suppression `setTimeout(100)` artificiel)
   - `e0c8575` — fusion phase 1+2+3 dans `loadData` (`lib/store.ts`) → 24 queries Supabase **en parallèle** au lieu de 2 vagues séquentielles. Gain estimé cold-load : ~450-750 ms.
   - `03da339` — `select('*')` → colonnes explicites sur 20 read queries
   - `a93885e` — framer-motion en `LazyMotion` + alias `m`

### Reste à faire — perf
- **#4 :** pages statiques (`/cgu`, `/mentions-legales`, `/confidentialite`, `/conseils`, `/alimentation`) → server components (gain first-paint instant). Actuellement `"use client"` sur 76 fichiers.
- **#5 :** ajouter `.limit()` sur les listes longues (`getMoodEntries`, `getSymptomEntries`, `getJournalNotes`...) — pas de pagination aujourd'hui, sur 9 mois ça grossit.
- **#6 :** auditer `useEffect` re-fetch sur navigation côté pages détail.
- **Supabase client** dans first-load chunk (~200K) — vérifier qu'on ne l'init pas sur landing publique.

### Reste à faire — design (gros chantier)
Issam veut une refonte design : "pages moches, pas d'animation, pas moderne".
**Pas encore commencé.** Direction à caler avec lui :
- Vibe (glassmorphism Apple Health / pastel doux Flo / bold Duolingo / minimaliste Linear ?)
- Pages prio (dashboard / journal / conseils ?)
- Animations (transitions de route, stagger scroll, hover, milestones confetti…)
**Approche conseillée :** mock visuel sur 1 page (dashboard) → branche `design/dashboard-v2` → preview Vercel → validation Issam → généralisation.

### Reste à faire — feature
- Carte partage réseaux sociaux
- Rapport hebdomadaire
- Témoignages semaines
- Vue partenaire
- Notifications partenaire
- Apple Health sync

## Anti-pièges (lessons learned)
- **Ne pas re-faire le diag perf à l'aveugle.** Le `select('*')` a déjà été nettoyé dans `lib/supabase-api.ts`. Les `*` restants (`app/api/export/route.ts`) sont **légitimes** (export GDPR). `lucide-react` est en named imports partout — clean.
- **`framer-motion` est déjà lazy-loaded.** Vérifier `MotionProvider.tsx` avant de toucher.
- **Build :** ne pas retirer `typescript.ignoreBuildErrors: true` sans tester (OOM Vercel).
- **`loadData` séquentiel = anti-pattern ici** : tout est loading bool global, donc fusionner.

## Fichiers clés à connaître
- `lib/store.ts` — Zustand store + `loadData` (fan-out parallèle 24 queries)
- `lib/supabase-api.ts` — toutes les queries DB
- `lib/community-api.ts` — forum
- `app/page.tsx` — dashboard
- `MotionProvider.tsx` — wrapper LazyMotion
- `next.config.ts` — config build
- `supabase-schema.sql` — schéma DB
- `supabase-rls-fix.sql` — policies RLS

## Commands
```bash
bun install        # ou npm i
bun dev            # next dev
bun run build      # next build
bun test           # vitest
bun run e2e        # playwright
```

## Credentials (réf MEMORY.md d'Issam)
- Supabase : projet `xddutehapskhgrgimpme`
- GitHub PAT : voir `~/.openclaw/workspace/TOOLS.md`
- Vercel token : voir `~/.openclaw/workspace/TOOLS.md`

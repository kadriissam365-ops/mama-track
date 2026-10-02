// Coach IA — endpoint chat streaming
// POST { messages: {role:'user'|'assistant', content:string}[] }
// Réponse : flux texte brut (Web ReadableStream) avec les deltas du modèle.
// - Auth via Supabase SSR (cookie)
// - Limite gratuite : 5 messages utilisateur / jour (table coach_messages)
// - Contexte bébé injecté dans le system prompt (nom, âge, sexe, dernière mesure)
// - RAG simple : keyword detection -> sections issues de conseils-data /
//   diversification-data / HAS_VISITS / urgences-data
// - Persistance des messages user + assistant dans coach_messages
//
// IMPORTANT : aucun diagnostic, ton bienveillant, sources FR (HAS / Santé.fr /
// INPES). Si urgence détectée -> rappel d'appeler le 15.

import { hasAiConsent, aiConsentRequiredResponse } from "@/lib/ai-consent-server";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-json";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/enfant/supabase/server";
import {
  ageInDays,
  formatAge,
  type Baby,
} from "@/lib/enfant/baby";
import { AGE_RANGES, ageRangeForMonths } from "@/lib/enfant/conseils-data";
import {
  FOODS,
  FOOD_RULES,
  MAJOR_ALLERGENS,
  GUIDE_SECTIONS,
} from "@/lib/enfant/diversification-data";
import { HAS_VISITS } from "@/lib/enfant/checklist-data";
import { EMERGENCY_NUMBERS, EMERGENCY_FICHES } from "@/lib/enfant/urgences-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL_ID = "claude-haiku-4-5-20251001";
const FREE_DAILY_LIMIT = 5;

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

// =============================================================
// RAG : keyword detection -> texte synthétique injecté dans system
// =============================================================
function detectTopics(text: string): Set<string> {
  const t = text.toLowerCase();
  const topics = new Set<string>();
  const has = (...kws: string[]) => kws.some((k) => t.includes(k));

  if (has("sommeil", "dort", "dormir", "réveil", "sieste", "nuit", "endormir"))
    topics.add("sommeil");
  if (has("repas", "biberon", "tétée", "tetee", "allait", "manger", "mange", "lait"))
    topics.add("alimentation");
  if (
    has(
      "diversification",
      "aliment",
      "purée",
      "puree",
      "légume",
      "legume",
      "fruit",
      "viande",
      "poisson",
      "œuf",
      "oeuf",
      "yaourt",
      "fromage",
      "allerg",
      "miel",
      "sel",
      "sucre",
      "dme",
    )
  )
    topics.add("diversification");
  if (has("couche", "selle", "pipi", "caca", "diarrhée", "diarrhee", "constipation"))
    topics.add("couches");
  if (has("vaccin", "rappel", "ror", "dtp", "pneumocoque", "méningocoque", "meningocoque"))
    topics.add("vaccins");
  if (
    has(
      "urgence",
      "fièvre",
      "fievre",
      "convulsion",
      "étouffement",
      "etouffement",
      "chute",
      "brûlure",
      "brulure",
      "intoxication",
      "déshydratation",
      "deshydratation",
      "noyade",
      "secouement",
    )
  )
    topics.add("urgences");
  if (has("visite", "rdv", "rendez-vous", "pédiatre", "pediatre", "agenda", "checklist", "has"))
    topics.add("agenda");

  return topics;
}

function buildKnowledgeContext(text: string, baby: Baby): string {
  const topics = detectTopics(text);
  if (topics.size === 0) return "";

  const months = Math.floor(ageInDays(baby.birth_date) / 30.44);
  const out: string[] = [];

  // Conseils par âge filtrés sur les catégories concernées
  if (
    topics.has("sommeil") ||
    topics.has("alimentation") ||
    topics.has("urgences") ||
    topics.has("agenda")
  ) {
    const range = ageRangeForMonths(months) ?? AGE_RANGES[AGE_RANGES.length - 1];
    if (range) {
      const wantedCats: Set<string> = new Set();
      if (topics.has("sommeil")) wantedCats.add("sommeil");
      if (topics.has("alimentation") || topics.has("diversification"))
        wantedCats.add("alimentation");
      if (topics.has("urgences")) wantedCats.add("sante");
      if (wantedCats.size === 0) wantedCats.add("sommeil");

      const filtered = range.conseils.filter((c) => wantedCats.has(c.category));
      if (filtered.length > 0) {
        out.push(
          `### Repères ${range.label} (Santé publique France / SFP / mpedia)`,
        );
        for (const c of filtered.slice(0, 6)) {
          out.push(`- **${c.title}** — ${c.body}`);
        }
      }
    }
  }

  // Diversification : aliments adaptés à l'âge + règles + allergènes
  if (topics.has("diversification") || topics.has("alimentation")) {
    const ageFoods = FOODS.filter(
      (f) => months >= f.introMonthMin && months <= f.introMonthMax + 4,
    ).slice(0, 12);
    if (ageFoods.length > 0) {
      out.push(`### Aliments adaptés à ${months} mois (PNNS / SFP)`);
      out.push(
        ageFoods
          .map(
            (f) =>
              `- ${f.label} (dès ${f.introMonthMin} mois${f.isMajorAllergen ? ", allergène majeur" : ""})${f.prepHint ? ` — ${f.prepHint}` : ""}`,
          )
          .join("\n"),
      );
    }

    const activeRules = FOOD_RULES.filter((r) => months < r.until);
    if (activeRules.length > 0) {
      out.push(`### Aliments à éviter à cet âge`);
      out.push(activeRules.map((r) => `- ${r.rule} — ${r.reason}`).join("\n"));
    }

    if (topics.has("diversification") && months <= 7) {
      out.push(
        `### Allergènes majeurs (introduction recommandée 4-6 mois — EAACI / INSERM)`,
      );
      out.push(
        MAJOR_ALLERGENS.slice(0, 6)
          .map((f) => `- ${f.label} (dès ${f.introMonthMin}m)`)
          .join("\n"),
      );

      const guide = GUIDE_SECTIONS.find((g) =>
        g.title.toLowerCase().includes("allerg"),
      );
      if (guide) out.push(`### Guide allergènes\n${guide.body}`);
    }
  }

  // Visites HAS proches de l'âge actuel
  if (topics.has("agenda") || topics.has("vaccins")) {
    const upcoming = HAS_VISITS.filter(
      (v) => v.ageMonths >= months - 1 && v.ageMonths <= months + 3,
    ).slice(0, 4);
    if (upcoming.length > 0) {
      out.push(`### Visites HAS prochaines (calendrier officiel CNAM/HAS)`);
      out.push(
        upcoming
          .map((v) => `- ${v.label} (${v.ageMonths} mois) — ${v.exam}`)
          .join("\n"),
      );
    }
  }

  // Urgences : numéros + 3-4 fiches les plus probables
  if (topics.has("urgences")) {
    out.push(`### Numéros d'urgence (France)`);
    out.push(
      EMERGENCY_NUMBERS.filter((n) => n.priority !== "info")
        .slice(0, 4)
        .map((n) => `- ${n.label} : **${n.number}** — ${n.description}`)
        .join("\n"),
    );

    const t = text.toLowerCase();
    const matched = EMERGENCY_FICHES.filter((f) =>
      t.includes(f.title.toLowerCase().split(" ")[0]),
    ).slice(0, 3);
    if (matched.length > 0) {
      out.push(`### Fiches secours pertinentes`);
      for (const f of matched) {
        out.push(
          `**${f.title}** — ${f.whenToCall}\nÉtapes : ${f.steps.slice(0, 3).join(" / ")}`,
        );
      }
    }
  }

  return out.join("\n\n");
}

// =============================================================
// System prompt builder
// =============================================================
async function buildSystemPrompt(
  baby: Baby,
  lastUserText: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const ageLabel = formatAge(baby.birth_date);
  const sex = baby.sex === "M" ? "garçon" : baby.sex === "F" ? "fille" : "bébé";

  // Dernière mesure connue (poids/taille/PC)
  let measurementLine = "";
  const { data: measure } = await supabase
    .from("measurements")
    .select("weight_g, height_cm, head_cm, measured_at")
    .eq("baby_id", baby.id)
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (measure) {
    const parts: string[] = [];
    if (measure.weight_g) parts.push(`${(measure.weight_g / 1000).toFixed(2)} kg`);
    if (measure.height_cm) parts.push(`${measure.height_cm} cm`);
    if (measure.head_cm) parts.push(`PC ${measure.head_cm} cm`);
    if (parts.length > 0) {
      measurementLine = `Dernière mesure (${measure.measured_at?.slice(0, 10) ?? ""}) : ${parts.join(", ")}.`;
    }
  }

  const knowledge = buildKnowledgeContext(lastUserText, baby);

  return [
    `Tu es **Coach Bébé**, l'assistant pédiatrique de l'app MamaTrack. Tu accompagnes des parents francophones avec des bébés de 0 à 36 mois.`,
    ``,
    `## Règles absolues`,
    `- Tu **n'es pas médecin** : tu ne diagnostiques jamais, tu ne prescris jamais de médicament ni de dose précise.`,
    `- Devant tout signe de gravité (fièvre <3 mois, convulsion, difficulté à respirer, déshydratation, traumatisme, comportement inhabituel marqué), recommande **immédiatement d'appeler le 15 (SAMU)** ou de consulter aux urgences pédiatriques.`,
    `- Tes réponses s'appuient sur les recommandations FR : **HAS, Santé publique France, INPES, Société française de pédiatrie, OMS**. Cite la source quand c'est pertinent.`,
    `- Pour toute question médicale qui dépasse les repères généraux, redirige vers le **pédiatre** ou le médecin traitant.`,
    ``,
    `## Style`,
    `- Tu **tutoies** le parent.`,
    `- Tu es bienveillant·e, rassurant·e, jamais culpabilisant·e.`,
    `- Réponses **courtes et actionnables** : 3 à 6 phrases max, ou liste à puces de 3-5 points si une checklist est plus claire.`,
    `- Termine en proposant 1 question de suivi ou 1 prochaine étape concrète quand c'est utile.`,
    `- Pas de blabla d'introduction du type "Bonne question !".`,
    ``,
    `## Contexte bébé`,
    `- Prénom : **${baby.name}**`,
    `- Âge : ${ageLabel}`,
    `- Sexe : ${sex}`,
    measurementLine ? `- ${measurementLine}` : "",
    ``,
    knowledge
      ? `## Sources internes pertinentes pour cette question\n${knowledge}\n\nUtilise ces éléments en priorité. Reformule, ne recopie pas mot à mot.`
      : `## Pas de source interne pertinente trouvée pour cette question\nRéponds depuis tes connaissances générales en restant fidèle aux repères FR (HAS, SFP).`,
  ]
    .filter(Boolean)
    .join("\n");
}

// =============================================================
// Helpers
// =============================================================
// =============================================================
// POST handler
// =============================================================
export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] } = {};
  try {
    body = await readJsonBody(request) as typeof body;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "missing_messages" }, { status: 400 });
  }

  // Sanitize : on ne garde que role + content (pas de champs externes)
  const cleanMessages: ChatMessage[] = messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-12); // garde au max 12 derniers tours pour limiter les tokens

  const lastUser = [...cleanMessages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return Response.json({ error: "no_user_message" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "missing_api_key", hint: "ANTHROPIC_API_KEY n'est pas configuré côté serveur." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!await hasAiConsent(supabase, user.id)) return aiConsentRequiredResponse();
  const { baby } = await requireUserAndBaby(user);
  if (!baby) return Response.json({ error: "no_baby" }, { status: 400 });
  const role = await getUserRole(user, baby);
  if (role !== "owner" && role !== "caregiver") return Response.json({ error: "Accès en lecture seule" }, { status: 403 });
  if (!await consumeRateLimit(supabase, RATE_LIMITS.babyCoach)) return Response.json({ error: "daily_limit_reached", message: "Les 5 questions du jour ont été utilisées. Réessaie demain." }, { status: 429 });

  // Persiste le dernier message utilisateur
  await supabase.from("coach_messages").insert({
    user_id: user.id,
    baby_id: baby.id,
    role: "user",
    content: lastUser.content,
  });

  const system = await buildSystemPrompt(baby, lastUser.content, supabase);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const upstream = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 800,
    system,
    messages: cleanMessages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let assembled = "";
      try {
        for await (const event of upstream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            assembled += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        }
        // Persiste la réponse complète
        if (assembled.trim().length > 0) {
          await supabase.from("coach_messages").insert({
            user_id: user.id,
            baby_id: baby.id,
            role: "assistant",
            content: assembled,
          });
        }
      } catch (err) {
        console.error("[enfant/coach] upstream", err instanceof Error ? err.name : "unknown");
        const msg = "Le service est momentanément indisponible. Réessaie plus tard.";
        controller.enqueue(
          encoder.encode(`\n\n[Erreur Coach IA] ${msg}`),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      try {
        upstream.controller.abort();
      } catch {
        // ignore
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Coach-Daily-Limit": String(FREE_DAILY_LIMIT),
    },
  });
}

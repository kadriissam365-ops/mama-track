import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { streamChat, isAiConfigured } from "@/lib/ai-providers";
import { loadContext } from "@/lib/health-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DayName = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";

interface Meal {
  title: string;
  ingredients: string[];
  tip?: string;
}

interface DayPlan {
  day: DayName;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: { title: string; ingredients: string[] }[];
}

interface ShoppingCategory {
  category: string;
  items: string[];
}

interface MealPlan {
  weekStart: string;
  trimester: 1 | 2 | 3;
  days: DayPlan[];
  shoppingList: ShoppingCategory[];
  weeklyFocus: string;
}

interface ProfileRow {
  is_premium?: boolean;
  premium_until?: string | null;
  food_allergies?: string[] | null;
  dietary_preferences?: string | null;
}

interface MealPlanRow {
  plan: MealPlan;
  trimester: number;
  week_start: string;
  generated_at?: string | null;
}

function mondayOfCurrentWeekParis(): string {
  // Format YYYY-MM-DD du lundi de la semaine courante en Europe/Paris.
  const fmt = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = fmt.formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  // Reconstruit une date locale à minuit (UTC) pour calculer le décalage jusqu'au lundi.
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  // En JS, getUTCDay : dimanche = 0, lundi = 1, ... samedi = 6.
  const weekday = utcDate.getUTCDay();
  // décalage en jours depuis le lundi (lundi = 0)
  const offset = (weekday + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - offset);
  const yyyy = utcDate.getUTCFullYear();
  const mm = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utcDate.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function trimesterFromWeekSA(weekSA: number | null): 1 | 2 | 3 {
  if (weekSA === null) return 2;
  if (weekSA <= 13) return 1;
  if (weekSA <= 27) return 2;
  return 3;
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out.trim();
}

function stripJsonFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    if (t.endsWith("```")) t = t.slice(0, -3);
  }
  // Si le modèle a ajouté du texte avant/après, on tente de capturer la 1re accolade équilibrée.
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace > 0 || lastBrace !== t.length - 1) {
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      t = t.slice(firstBrace, lastBrace + 1);
    }
  }
  return t.trim();
}

const TRIMESTER_FOCUS: Record<1 | 2 | 3, string> = {
  1: "T1 (1-13 SA) : nausées fréquentes — privilégie des repas légers, fractionnés, riches en folates (légumes verts, légumineuses, agrumes). Évite les odeurs fortes et les plats trop gras le matin.",
  2: "T2 (14-27 SA) : énergie revenue — équilibre protéines (viande blanche cuite, poisson cuit, œufs cuits, légumineuses), féculents complets, calcium (laitages pasteurisés) et fer (lentilles, viande rouge bien cuite + vitamine C).",
  3: "T3 (28+ SA) : brûlures d'estomac et place limitée — repas plus petits et plus fréquents, évite épicé / friture / trop gras le soir, augmente calcium, fer et oméga-3 (sardines, maquereau, noix, lin), bonne hydratation.",
};

const FORBIDDEN_FOODS_RULE = `INTERDITS ABSOLUS pendant la grossesse — n'inclus JAMAIS :
- fromages au lait cru, fromages à pâte molle à croûte fleurie ou persillée (camembert, brie, roquefort) sauf mention "pasteurisé" explicite
- viandes crues / saignantes / fumées (carpaccio, tartare, jambon cru, charcuterie crue, saucisson, rillettes, pâté)
- poissons crus ou fumés (sushi, sashimi, saumon fumé, tarama, huîtres crues)
- œufs crus ou pas assez cuits (mayonnaise maison, mousse au chocolat maison, tiramisu maison)
- alcool (zéro alcool, y compris en cuisine)
- foie / abats (vitamine A)
- graines germées crues
- lait cru
Toutes les viandes / poissons / œufs proposés doivent être cuits à cœur.`;

function buildPrompt(args: {
  trimester: 1 | 2 | 3;
  weekStart: string;
  weekSA: number | null;
  allergies: string[];
  diet: string;
}): { system: string; user: string } {
  const { trimester, weekStart, weekSA, allergies, diet } = args;
  const dietRule = (() => {
    switch (diet) {
      case "vegetarien":
        return "REGIME : végétarien — pas de viande ni de poisson. Remplace par œufs cuits, laitages pasteurisés, légumineuses, tofu cuit, seitan, fromages pasteurisés.";
      case "vegan":
        return "REGIME : végan strict — pas de produit animal du tout. Soigne particulièrement le fer (légumineuses + vitamine C), la B12 (penser supplémentation déjà prescrite), les oméga-3 (lin, noix), le calcium (boissons végétales enrichies, tofu enrichi).";
      case "sans_porc":
        return "REGIME : sans porc — pas de porc ni de produits dérivés (pas de jambon blanc même cuit, pas de lardons).";
      case "halal":
        return "REGIME : halal — viandes halal uniquement, pas de porc, pas d'alcool même en cuisson.";
      case "casher":
        return "REGIME : casher — pas de porc ni fruits de mer, pas de mélange viande/lait dans un même repas.";
      default:
        return "REGIME : aucune restriction particulière.";
    }
  })();

  const allergyRule = allergies.length > 0
    ? `ALLERGIES STRICTES (à exclure totalement, y compris traces et ingrédients dérivés) : ${allergies.join(", ")}.`
    : "ALLERGIES : aucune déclarée.";

  const system = `Tu es une sage-femme française nutritionniste qui prépare un plan repas hebdomadaire personnalisé pour une femme enceinte.

${FORBIDDEN_FOODS_RULE}

ADAPTATION TRIMESTRE :
${TRIMESTER_FOCUS[trimester]}

${dietRule}

${allergyRule}

CONTRAINTES DE SORTIE :
- Tu réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte autour, sans balise markdown, sans commentaire.
- Le JSON doit suivre EXACTEMENT le schéma demandé.
- Recettes simples, françaises, abordables, de saison si possible.
- Ingrédients en français, quantités courtes (ex : "200 g de blanc de poulet", "1 yaourt nature").`;

  const user = `Génère le plan repas de la semaine commençant le lundi ${weekStart}${weekSA !== null ? ` (semaine de grossesse : ${weekSA} SA, trimestre ${trimester})` : ` (trimestre ${trimester})`}.

Schéma JSON STRICT à respecter :
{
  "weekStart": "${weekStart}",
  "trimester": ${trimester},
  "days": [
    {
      "day": "lundi",
      "breakfast": { "title": "...", "ingredients": ["...", "..."], "tip": "optionnel" },
      "lunch":     { "title": "...", "ingredients": ["...", "..."], "tip": "optionnel" },
      "dinner":    { "title": "...", "ingredients": ["...", "..."], "tip": "optionnel" },
      "snacks":    [ { "title": "...", "ingredients": ["...", "..."] } ]
    }
    // ... mardi, mercredi, jeudi, vendredi, samedi, dimanche dans cet ordre, 7 jours au total
  ],
  "shoppingList": [
    { "category": "Fruits & Légumes",   "items": ["..."] },
    { "category": "Produits laitiers",  "items": ["..."] },
    { "category": "Viandes & Poissons", "items": ["..."] },
    { "category": "Féculents",          "items": ["..."] },
    { "category": "Épicerie",           "items": ["..."] }
  ],
  "weeklyFocus": "phrase courte (max 30 mots) sur le focus nutritionnel de la semaine selon le trimestre"
}

Réponds maintenant avec UNIQUEMENT le JSON.`;

  return { system, user };
}

function isMealPlanShape(value: unknown): value is MealPlan {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.weekStart !== "string") return false;
  if (typeof v.trimester !== "number") return false;
  if (!Array.isArray(v.days) || v.days.length === 0) return false;
  if (!Array.isArray(v.shoppingList)) return false;
  if (typeof v.weeklyFocus !== "string") return false;
  return true;
}

async function generateAndCachePlan(args: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  weekStart: string;
  trimester: 1 | 2 | 3;
  weekSA: number | null;
  allergies: string[];
  diet: string;
}): Promise<MealPlan> {
  const { supabase, userId, weekStart, trimester, weekSA, allergies, diet } = args;
  const { system, user } = buildPrompt({ trimester, weekStart, weekSA, allergies, diet });

  const stream = streamChat({
    systemBlocks: [{ text: system, cache: true }],
    history: [],
    userMessage: user,
    maxTokens: 3000,
  });
  const raw = await streamToText(stream);
  if (!raw) throw new Error("Réponse IA vide");
  const cleaned = stripJsonFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Réponse IA non JSON");
  }
  if (!isMealPlanShape(parsed)) {
    throw new Error("Schéma JSON inattendu");
  }
  // Force la cohérence des champs renvoyés.
  const plan: MealPlan = {
    ...parsed,
    weekStart,
    trimester,
  };

  const sb = supabase;
  await sb.from("meal_plans").upsert(
    {
      user_id: userId,
      week_start: weekStart,
      trimester,
      preferences: { allergies, diet },
      plan,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_start" },
  );

  return plan;
}

async function handle(req: Request): Promise<Response> {
  if (!isAiConfigured()) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: profileRaw } = await sb
    .from("profiles")
    .select("is_premium, premium_until, food_allergies, dietary_preferences")
    .eq("id", user.id)
    .maybeSingle();
  const profile = (profileRaw as ProfileRow | null) ?? null;
  const premium =
    Boolean(profile?.is_premium) &&
    (!profile?.premium_until || new Date(profile.premium_until) > new Date());
  if (!premium) {
    return NextResponse.json({ error: "Fonctionnalité Premium" }, { status: 402 });
  }

  const url = new URL(req.url);
  let force = url.searchParams.get("force") === "1";
  if (req.method === "POST") {
    try {
      const body = (await req.json().catch(() => ({}))) as { regenerate?: boolean };
      if (body && typeof body === "object" && body.regenerate === true) force = true;
    } catch {
      // body optionnel
    }
  }

  const weekStart = mondayOfCurrentWeekParis();
  const ctx = await loadContext(user.id, supabase);
  const trimester = trimesterFromWeekSA(ctx.weekSA);

  if (!force) {
    const { data: cachedRaw } = await sb
      .from("meal_plans")
      .select("plan, trimester, week_start, generated_at")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .maybeSingle();
    const cached = cachedRaw as MealPlanRow | null;
    if (cached?.plan) {
      return NextResponse.json({
        plan: cached.plan,
        cached: true,
        weekStart: cached.week_start,
        trimester: cached.trimester,
      });
    }
  }

  const allergies = Array.isArray(profile?.food_allergies) ? profile?.food_allergies ?? [] : [];
  const diet = profile?.dietary_preferences ?? "aucune";

  try {
    const plan = await generateAndCachePlan({
      supabase,
      userId: user.id,
      weekStart,
      trimester,
      weekSA: ctx.weekSA,
      allergies,
      diet,
    });
    return NextResponse.json({ plan, cached: false, weekStart, trimester });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de génération";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}

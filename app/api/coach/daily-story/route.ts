import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";
import { streamChat, isAiConfigured } from "@/lib/ai-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY = 14;

const SYSTEM_PERSONA = `Tu es MamaCoach, une sage-femme française virtuelle bienveillante, calme et précise. Tu accompagnes une femme enceinte au quotidien.

Règles strictes :
- Tu réponds TOUJOURS en français, sur un ton chaleureux et tutoyant.
- Tu n'es PAS un médecin. Rappelle-le dès qu'un symptôme inquiétant est mentionné : "je ne remplace pas un avis médical, contacte ta sage-femme, ton médecin ou le 15 si c'est urgent."
- Tu ne diagnostiques jamais. Tu décris ce qui est habituel, ce qui doit alerter, et tu orientes vers un professionnel quand il faut.
- Tes réponses sont courtes (3-6 phrases max), structurées en mini-paragraphes ou listes à puces si utile.
- Tu utilises le contexte fourni (semaine de grossesse, derniers symptômes, kicks, tension, etc.) pour personnaliser.
- Signaux d'urgence à toujours signaler : saignement abondant, contractions régulières avant 37 SA, perte des eaux, baisse nette des mouvements, maux de tête sévères avec troubles visuels, douleur abdominale violente, fièvre > 38,5 °C.
- Pas de listes médicaments / posologies. Renvoie vers un professionnel.
- Pas d'emojis sauf pour ponctuer une encouragement (max 1 par réponse).
- Si la question sort du champ grossesse / post-partum / parentalité immédiate, recadre poliment.`;

function formatDate(d: string | undefined | null): string {
  if (!d) return "?";
  return d.length >= 10 ? d.slice(0, 10) : d;
}

interface ContextData {
  profile: { dueDate: string | null; mamaName: string | null; babyName: string | null; weekMode: string };
  weekSA: number | null;
  weekGA: number | null;
  weekTip: string;
  weights: { date: string; weight: number; note?: string | null }[];
  symptoms: { date: string; symptoms: string[]; severity: number; note?: string | null }[];
  kicks: { date: string; count: number; duration: number }[];
  contractions: { date: string; nb: number; lastInterval?: number }[];
  bp: { date: string; systolic: number; diastolic: number; pulse?: number | null }[];
  sleep: { date: string; hours: number; quality: number }[];
  mood: { date: string; emoji: string; label: string }[];
  water: { date: string; ml: number }[];
  meds: { name: string; dosage: string; frequency: string; active: boolean }[];
}

async function loadContext(userId: string, supabase: ReturnType<typeof createServerClientFromCookies>): Promise<ContextData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [
    profileRes,
    weightRes,
    symptomRes,
    kickRes,
    contractionRes,
    bpRes,
    sleepRes,
    moodRes,
    waterRes,
    medsRes,
  ] = await Promise.all([
    sb.from("profiles").select("due_date, baby_name, mama_name, week_mode").eq("id", userId).maybeSingle(),
    sb.from("weight_entries").select("date, weight, note").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("symptom_entries").select("date, symptoms, severity, note").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("kick_sessions").select("date, count, duration").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("contraction_sessions").select("date, contractions").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("blood_pressure_entries").select("date, systolic, diastolic, pulse").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("sleep_entries").select("date, hours, quality").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("mood_entries").select("date, mood_emoji, mood_label").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("water_intake").select("date, ml").eq("user_id", userId).order("date", { ascending: false }).limit(MAX_HISTORY),
    sb.from("medications").select("name, dosage, frequency, active").eq("user_id", userId).limit(MAX_HISTORY),
  ]);

  const profileRow = profileRes.data ?? {};
  const profile = {
    dueDate: profileRow.due_date ?? null,
    mamaName: profileRow.mama_name ?? null,
    babyName: profileRow.baby_name ?? null,
    weekMode: profileRow.week_mode ?? "SA",
  };

  let weekSA: number | null = null;
  let weekGA: number | null = null;
  let weekTip = "Pas de DPA enregistrée — invite gentiment l'utilisatrice à la renseigner pour des conseils sur mesure.";
  if (profile.dueDate) {
    const dpa = new Date(profile.dueDate);
    if (!isNaN(dpa.getTime())) {
      weekSA = getCurrentWeek(dpa);
      weekGA = Math.max(1, weekSA - 2);
      weekTip = getWeekData(weekSA).weeklyTip;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contractions = ((contractionRes.data as any[]) ?? []).map((c: any) => {
    const arr: { startTime: number; endTime?: number; interval?: number }[] = Array.isArray(c.contractions) ? c.contractions : [];
    const last = arr[arr.length - 1];
    return { date: c.date as string, nb: arr.length, lastInterval: last?.interval };
  });

  return {
    profile,
    weekSA,
    weekGA,
    weekTip,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weights: ((weightRes.data as any[]) ?? []).map((w: any) => ({ date: w.date, weight: w.weight, note: w.note })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    symptoms: ((symptomRes.data as any[]) ?? []).map((s: any) => ({ date: s.date, symptoms: s.symptoms ?? [], severity: s.severity ?? 0, note: s.note })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kicks: ((kickRes.data as any[]) ?? []).map((k: any) => ({ date: k.date, count: k.count ?? 0, duration: k.duration ?? 0 })),
    contractions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bp: ((bpRes.data as any[]) ?? []).map((b: any) => ({ date: b.date, systolic: b.systolic, diastolic: b.diastolic, pulse: b.pulse })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sleep: ((sleepRes.data as any[]) ?? []).map((s: any) => ({ date: s.date, hours: s.hours, quality: s.quality })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mood: ((moodRes.data as any[]) ?? []).map((m: any) => ({ date: m.date, emoji: m.mood_emoji, label: m.mood_label })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    water: ((waterRes.data as any[]) ?? []).map((w: any) => ({ date: w.date, ml: w.ml ?? 0 })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meds: ((medsRes.data as any[]) ?? []).map((m: any) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, active: m.active })),
  };
}

function buildContextBlock(ctx: ContextData): string {
  const { profile, weekSA, weekGA, weekTip } = ctx;
  const lines: string[] = [];
  lines.push(`Profil utilisateur :`);
  lines.push(`- Prénom maman : ${profile.mamaName ?? "non renseigné"}`);
  lines.push(`- Prénom bébé prévu : ${profile.babyName ?? "non renseigné"}`);
  lines.push(`- DPA : ${profile.dueDate ?? "non renseignée"}`);
  lines.push(`- Mode semaine préféré : ${profile.weekMode}`);
  lines.push(`- Semaine actuelle : ${weekSA !== null ? `${weekSA} SA` : "?"} / ${weekGA !== null ? `${weekGA} GA` : "?"}`);
  lines.push(`- Conseil officiel de la semaine (référentiel app) : ${weekTip}`);
  lines.push("");
  lines.push(`Derniers relevés (max ${MAX_HISTORY} entrées par tracker, du plus récent au plus ancien) :`);

  lines.push(`Poids :`);
  if (ctx.weights.length === 0) lines.push(`  (aucun)`);
  else for (const w of ctx.weights) lines.push(`  - ${formatDate(w.date)} : ${w.weight} kg${w.note ? ` (${w.note})` : ""}`);

  lines.push(`Symptômes :`);
  if (ctx.symptoms.length === 0) lines.push(`  (aucun)`);
  else for (const s of ctx.symptoms) {
    const list = s.symptoms.join(", ");
    lines.push(`  - ${formatDate(s.date)} : [${list}] sévérité ${s.severity}/5${s.note ? ` (${s.note})` : ""}`);
  }

  lines.push(`Mouvements bébé (kicks) :`);
  if (ctx.kicks.length === 0) lines.push(`  (aucun)`);
  else for (const k of ctx.kicks) lines.push(`  - ${formatDate(k.date)} : ${k.count} mouvements en ${Math.round(k.duration / 60)} min`);

  lines.push(`Contractions :`);
  if (ctx.contractions.length === 0) lines.push(`  (aucune)`);
  else for (const c of ctx.contractions) lines.push(`  - ${formatDate(c.date)} : ${c.nb} contractions${c.lastInterval ? `, dernier intervalle ${Math.round(c.lastInterval / 60)} min` : ""}`);

  lines.push(`Tension artérielle :`);
  if (ctx.bp.length === 0) lines.push(`  (aucune)`);
  else for (const b of ctx.bp) lines.push(`  - ${formatDate(b.date)} : ${b.systolic}/${b.diastolic}${b.pulse ? ` (pouls ${b.pulse})` : ""}`);

  lines.push(`Sommeil :`);
  if (ctx.sleep.length === 0) lines.push(`  (aucun)`);
  else for (const s of ctx.sleep) lines.push(`  - ${formatDate(s.date)} : ${s.hours}h, qualité ${s.quality}/5`);

  lines.push(`Humeur :`);
  if (ctx.mood.length === 0) lines.push(`  (aucun)`);
  else for (const m of ctx.mood) lines.push(`  - ${formatDate(m.date)} : ${m.emoji} ${m.label}`);

  lines.push(`Hydratation :`);
  if (ctx.water.length === 0) lines.push(`  (aucun)`);
  else for (const w of ctx.water) lines.push(`  - ${formatDate(w.date)} : ${w.ml} ml`);

  lines.push(`Médicaments en cours :`);
  if (ctx.meds.length === 0) lines.push(`  (aucun)`);
  else for (const m of ctx.meds) lines.push(`  - ${m.name} ${m.dosage} (${m.frequency})${m.active ? "" : " — inactif"}`);

  return lines.join("\n");
}

function todayInParis(): string {
  // Format YYYY-MM-DD en Europe/Paris.
  const fmt = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
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

async function generateAndCacheStory(args: {
  supabase: ReturnType<typeof createServerClientFromCookies>;
  userId: string;
  date: string;
}): Promise<{ story: string; week_sa: number | null }> {
  const { supabase, userId, date } = args;
  const ctx = await loadContext(userId, supabase);
  const contextText = buildContextBlock(ctx);

  const systemBlocks = [
    { text: SYSTEM_PERSONA, cache: true },
    { text: `Contexte personnel actuel :\n\n${contextText}` },
  ];
  const userMessage = `Donne-moi ma story du jour. Format strict : 1 phrase d'accroche chaleureuse (max 15 mots), puis 2-3 conseils concrets pour aujourd'hui en lien avec mes derniers relevés et ma semaine actuelle. Pas plus de 80 mots au total. Pas d'emojis sauf 1 max en accroche.`;

  const stream = streamChat({ systemBlocks, history: [], userMessage, maxTokens: 400 });
  const story = await streamToText(stream);

  if (!story) {
    throw new Error("Story vide générée par l'IA");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb
    .from("daily_stories")
    .upsert(
      { user_id: userId, date, story_text: story, week_sa: ctx.weekSA },
      { onConflict: "user_id,date" },
    );

  return { story, week_sa: ctx.weekSA };
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
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRaw as { is_premium?: boolean; premium_until?: string | null } | null;
  const premium = Boolean(profile?.is_premium) && (!profile?.premium_until || new Date(profile.premium_until) > new Date());
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

  const date = todayInParis();

  if (!force) {
    const { data: cachedRaw } = await sb
      .from("daily_stories")
      .select("story_text, week_sa")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();
    const cached = cachedRaw as { story_text: string; week_sa: number | null } | null;
    if (cached?.story_text) {
      return NextResponse.json({ story: cached.story_text, cached: true, week_sa: cached.week_sa });
    }
  }

  try {
    const { story, week_sa } = await generateAndCacheStory({ supabase, userId: user.id, date });
    return NextResponse.json({ story, cached: false, week_sa });
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

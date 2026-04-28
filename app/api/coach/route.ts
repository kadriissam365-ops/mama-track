import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClientFromCookies } from "@/lib/supabase";
import { getCurrentWeek, getWeekData } from "@/lib/pregnancy-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_HISTORY = 14;

type ChatRole = "user" | "assistant";
interface IncomingMessage {
  role: ChatRole;
  content: string;
}

interface RequestBody {
  messages?: IncomingMessage[];
  action?: "weekly_tip" | "signal_check";
}

interface AlertItem {
  level: "info" | "warn" | "red";
  message: string;
  source: string;
}

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

function buildContextBlock(args: {
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
}): string {
  const { profile, weekSA, weekGA, weekTip } = args;
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
  if (args.weights.length === 0) lines.push(`  (aucun)`);
  else for (const w of args.weights) lines.push(`  - ${formatDate(w.date)} : ${w.weight} kg${w.note ? ` (${w.note})` : ""}`);

  lines.push(`Symptômes :`);
  if (args.symptoms.length === 0) lines.push(`  (aucun)`);
  else for (const s of args.symptoms) {
    const list = s.symptoms.join(", ");
    lines.push(`  - ${formatDate(s.date)} : [${list}] sévérité ${s.severity}/5${s.note ? ` (${s.note})` : ""}`);
  }

  lines.push(`Mouvements bébé (kicks) :`);
  if (args.kicks.length === 0) lines.push(`  (aucun)`);
  else for (const k of args.kicks) lines.push(`  - ${formatDate(k.date)} : ${k.count} mouvements en ${Math.round(k.duration / 60)} min`);

  lines.push(`Contractions :`);
  if (args.contractions.length === 0) lines.push(`  (aucune)`);
  else for (const c of args.contractions) lines.push(`  - ${formatDate(c.date)} : ${c.nb} contractions${c.lastInterval ? `, dernier intervalle ${Math.round(c.lastInterval / 60)} min` : ""}`);

  lines.push(`Tension artérielle :`);
  if (args.bp.length === 0) lines.push(`  (aucune)`);
  else for (const b of args.bp) lines.push(`  - ${formatDate(b.date)} : ${b.systolic}/${b.diastolic}${b.pulse ? ` (pouls ${b.pulse})` : ""}`);

  lines.push(`Sommeil :`);
  if (args.sleep.length === 0) lines.push(`  (aucun)`);
  else for (const s of args.sleep) lines.push(`  - ${formatDate(s.date)} : ${s.hours}h, qualité ${s.quality}/5`);

  lines.push(`Humeur :`);
  if (args.mood.length === 0) lines.push(`  (aucun)`);
  else for (const m of args.mood) lines.push(`  - ${formatDate(m.date)} : ${m.emoji} ${m.label}`);

  lines.push(`Hydratation :`);
  if (args.water.length === 0) lines.push(`  (aucun)`);
  else for (const w of args.water) lines.push(`  - ${formatDate(w.date)} : ${w.ml} ml`);

  lines.push(`Médicaments en cours :`);
  if (args.meds.length === 0) lines.push(`  (aucun)`);
  else for (const m of args.meds) lines.push(`  - ${m.name} ${m.dosage} (${m.frequency})${m.active ? "" : " — inactif"}`);

  return lines.join("\n");
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

function computeAlerts(ctx: ContextData): AlertItem[] {
  const alerts: AlertItem[] = [];
  const sa = ctx.weekSA;

  // Kicks/jour < 10 après SA 28 (warn)
  if (sa !== null && sa >= 28 && ctx.kicks.length > 0) {
    // Aggregate kicks by day, look at most recent day
    const byDay = new Map<string, number>();
    for (const k of ctx.kicks) {
      byDay.set(k.date, (byDay.get(k.date) ?? 0) + k.count);
    }
    const sortedDays = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    const lastDay = sortedDays[0];
    if (lastDay && lastDay[1] < 10) {
      alerts.push({
        level: "warn",
        message: `Tu as compté ${lastDay[1]} mouvements le ${formatDate(lastDay[0])}. À partir de 28 SA, l'idéal est ≥ 10 par jour. Si bébé bouge moins que d'habitude, allonge-toi sur le côté gauche, hydrate-toi, et recompte. Si toujours peu de mouvements, contacte ta maternité.`,
        source: "kicks",
      });
    }
  }

  // Tension ≥ 140/90 sur les 2 derniers relevés (red)
  if (ctx.bp.length >= 2) {
    const [a, b] = ctx.bp;
    if (a.systolic >= 140 || a.diastolic >= 90) {
      if (b.systolic >= 140 || b.diastolic >= 90) {
        alerts.push({
          level: "red",
          message: `Ta tension est élevée sur tes 2 derniers relevés (${a.systolic}/${a.diastolic} et ${b.systolic}/${b.diastolic}). C'est un signal à prendre au sérieux pendant la grossesse — contacte ta sage-femme ou ton médecin rapidement, ou le 15 si tu as maux de tête, troubles visuels ou douleur au ventre.`,
          source: "blood_pressure",
        });
      }
    }
  }

  // Prise de poids > 500g/semaine après SA 20 (warn)
  if (sa !== null && sa > 20 && ctx.weights.length >= 2) {
    const sorted = [...ctx.weights].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const dLast = new Date(last.date).getTime();
    const dPrev = new Date(prev.date).getTime();
    const days = Math.max(1, (dLast - dPrev) / (1000 * 60 * 60 * 24));
    if (days <= 14) {
      const weeklyGain = ((last.weight - prev.weight) / days) * 7;
      if (weeklyGain > 0.5) {
        alerts.push({
          level: "warn",
          message: `Ta prise de poids récente est d'environ ${(weeklyGain * 1000).toFixed(0)} g/semaine. Au-delà de 20 SA, on recommande plutôt 300-400 g/semaine. Surveille rétention d'eau (mains, visage) et parle-en à ta sage-femme au prochain rendez-vous.`,
          source: "weight",
        });
      }
    }
  }

  return alerts;
}

function streamFromAnthropic(client: Anthropic, system: { type: "text"; text: string; cache_control?: { type: "ephemeral" } }[], userPayload: string, history: IncomingMessage[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of history) {
    if (m.role === "user" || m.role === "assistant") {
      const text = (m.content ?? "").toString().slice(0, 4000);
      if (text.trim()) messages.push({ role: m.role, content: text });
    }
  }
  if (userPayload) messages.push({ role: "user", content: userPayload });
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    messages.push({ role: "user", content: "Bonjour" });
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: 800,
          system,
          messages,
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        await stream.finalMessage();
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "erreur inconnue";
        controller.enqueue(encoder.encode(`\n\n[Désolée, je ne peux pas répondre maintenant — ${message}]`));
        controller.close();
      }
    },
  });
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 503 });
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ctx = await loadContext(user.id, supabase);

  if (body.action === "signal_check") {
    const alerts = computeAlerts(ctx);
    return NextResponse.json({ alerts });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const contextText = buildContextBlock(ctx);

  const system = [
    { type: "text" as const, text: SYSTEM_PERSONA, cache_control: { type: "ephemeral" as const } },
    { type: "text" as const, text: `Contexte personnel actuel :\n\n${contextText}` },
  ];

  if (body.action === "weekly_tip") {
    const weekLabel = ctx.weekSA !== null ? `${ctx.weekSA} SA` : "ce stade de grossesse";
    const userPayload = `Donne-moi le tip de la semaine pour ${weekLabel}, en exploitant si possible mes derniers relevés ci-dessus. Format : 1 phrase d'accroche chaleureuse, puis 2 ou 3 conseils concrets pour cette semaine. Garde un ton sage-femme.`;
    const stream = streamFromAnthropic(client, system, userPayload, []);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const stream = streamFromAnthropic(client, system, "", messages);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

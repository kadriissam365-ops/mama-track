import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { streamChat, isAiConfigured, type ChatMessage } from "@/lib/ai-providers";
import { computeAlerts, loadContext, type ContextData } from "@/lib/health-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function buildContextBlock(args: ContextData): string {
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

export async function POST(req: Request) {
  if (!isAiConfigured()) {
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

  const contextText = buildContextBlock(ctx);
  const systemBlocks = [
    { text: SYSTEM_PERSONA, cache: true },
    { text: `Contexte personnel actuel :\n\n${contextText}` },
  ];

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, no-transform",
    "X-Accel-Buffering": "no",
  };

  if (body.action === "weekly_tip") {
    const weekLabel = ctx.weekSA !== null ? `${ctx.weekSA} SA` : "ce stade de grossesse";
    const userPayload = `Donne-moi le tip de la semaine pour ${weekLabel}, en exploitant si possible mes derniers relevés ci-dessus. Format : 1 phrase d'accroche chaleureuse, puis 2 ou 3 conseils concrets pour cette semaine. Garde un ton sage-femme.`;
    return new Response(streamChat({ systemBlocks, history: [], userMessage: userPayload }), { headers });
  }

  const history: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : []).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  return new Response(streamChat({ systemBlocks, history }), { headers });
}

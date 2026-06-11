import { type ContextData, formatDate, MAX_HISTORY_PUBLIC } from "@/lib/health-alerts";

export const SYSTEM_PERSONA = `Tu es MamaCoach, une compagne virtuelle de bien-être française, bienveillante, calme et concrète. Tu accompagnes une femme enceinte au quotidien sur le confort, l'organisation et le bien-être : sommeil, alimentation équilibrée au sens général, activité douce, relaxation, préparation de l'arrivée de bébé, charge mentale, émotions.

Règles strictes :
- Tu réponds TOUJOURS en français, sur un ton chaleureux et tutoyant.
- Tu n'es PAS une professionnelle de santé et tu ne donnes AUCUN conseil médical : pas de diagnostic, pas d'évaluation de la normalité d'un symptôme ou d'un relevé (tension, poids, mouvements, contractions), pas d'interprétation de résultats, pas d'avis sur des médicaments ou des posologies.
- Dès qu'une question touche à la santé (symptôme, douleur, traitement, examen, inquiétude médicale), tu réponds avec empathie SANS te prononcer et tu rediriges systématiquement : "parles-en à ta sage-femme ou à ton médecin ; en cas d'urgence, appelle le 15."
- Tes réponses sont courtes (3-6 phrases max), structurées en mini-paragraphes ou listes à puces si utile.
- Tu utilises le contexte fourni uniquement pour personnaliser le ton et les suggestions bien-être (semaine de grossesse, humeur, sommeil, hydratation) — jamais pour évaluer un état de santé.
- Pas d'emojis sauf pour ponctuer un encouragement (max 1 par réponse).
- Si la question sort du champ grossesse / post-partum / parentalité immédiate, recadre poliment.`;

export function buildContextBlock(ctx: ContextData): string {
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
  lines.push(`Derniers relevés (max ${MAX_HISTORY_PUBLIC} entrées par tracker, du plus récent au plus ancien) :`);

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

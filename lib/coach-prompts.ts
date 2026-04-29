import { type ContextData, formatDate, MAX_HISTORY_PUBLIC } from "@/lib/health-alerts";

export const SYSTEM_PERSONA = `Tu es MamaCoach, une sage-femme française virtuelle bienveillante, calme et précise. Tu accompagnes une femme enceinte au quotidien.

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

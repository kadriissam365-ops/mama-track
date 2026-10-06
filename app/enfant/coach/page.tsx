import { childAgeMonths } from "@/lib/family-journey";
import { AiConsentGate } from "@/components/AiConsentGate";
import { redirect } from "next/navigation";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import {
  getCachedUser,
  requireUserAndBaby,
  formatAge,
} from "@/lib/enfant/baby";
import { CoachChat } from "./CoachChat";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coach IA — MamaTrack" };

function suggestionsForAge(months: number, name: string): string[] {
  if (months < 3) {
    return [
      `${name} pleure beaucoup le soir, que faire ?`,
      `Combien de tétées par jour à cet âge ?`,
      `Comment installer le couchage en sécurité ?`,
      `Quels sont les signes qui doivent m'alerter ?`,
    ];
  }
  if (months < 6) {
    return [
      `Quand commencer la diversification ?`,
      `${name} ne fait pas ses nuits, c'est normal ?`,
      `Quels jouets d'éveil à cet âge ?`,
      `Comment introduire les allergènes en sécurité ?`,
    ];
  }
  if (months < 12) {
    return [
      `Quels aliments puis-je donner à ${name} ?`,
      `Combien de siestes par jour ?`,
      `Comment gérer les premières dents ?`,
      `Idées de menus types diversification`,
    ];
  }
  if (months < 24) {
    return [
      `${name} fait des crises, comment réagir ?`,
      `À quel âge le langage doit décoller ?`,
      `Idées de repas équilibrés à cet âge`,
      `Quels jeux pour stimuler la motricité ?`,
    ];
  }
  if (months >= 36)
    return [
      `Quelles idées de jeux partager avec ${name} ?`,
      `Comment créer une routine du soir qui nous ressemble ?`,
      `Comment accompagner ses grandes émotions ?`,
      `Comment préparer les visites de santé entre 3 et 6 ans ?`,
    ];
  return [
    `Comment démarrer la propreté en douceur ?`,
    `${name} dit non à tout, comment gérer ?`,
    `Préparer l'entrée à l'école`,
    `Comment limiter les écrans à cet âge ?`,
  ];
}

export default async function CoachPage() {
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const { baby, supabase } = await requireUserAndBaby(user);
  if (!baby) redirect("/enfant/onboarding");

  const months = childAgeMonths(baby.birth_date);
  const suggestions = suggestionsForAge(months, baby.name);
  const ageLabel = formatAge(baby.birth_date);
  const { data: history, error } = await supabase
    .from("coach_messages")
    .select("id,role,content")
    .eq("baby_id", baby.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error("La conversation est momentanément indisponible.");

  return (
    <ModuleShell
      slug="coach"
      title="Un peu d’aide"
      subtitle={`Votre assistant parental pour ${baby.name} (${ageLabel}). Organisation, jeux et repères à discuter avec un professionnel.`}
    >
      <AiConsentGate
        feature="Assistant parental"
        description="L’assistant utilise le contexte du carnet pour te répondre. Il ne remplace jamais le suivi par un professionnel de santé."
        dataSent={[
          "Prénom, âge et sexe de votre enfant",
          "Dernières mesures de croissance",
          "Messages de la conversation",
        ]}
      >
        <CoachChat
          key={baby.id}
          initialMessages={(history ?? []).reverse()}
          babyName={baby.name}
          ageLabel={ageLabel}
          suggestions={suggestions}
        />
      </AiConsentGate>
    </ModuleShell>
  );
}

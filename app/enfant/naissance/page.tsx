import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Baby, ArrowRight, Heart } from "lucide-react";
import { createClient } from "@/lib/enfant/supabase/server";
import { parseBirth, todayInParis } from "@/lib/enfant/birth-validation";
import { Button, FormField, Input, Alert } from "@/components/enfant/ui";

async function registerBirth(form: FormData) {
  "use server";
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/auth/login");
  const parsed = parseBirth(form);
  if (parsed.error) redirect(`/enfant/naissance?error=${parsed.error}`);
  const id = String(form.get("request_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/enfant/naissance?error=save");
  const { error } = await client.rpc("register_baby_birth", {
    p_id: id,
    p_name: parsed.value.name,
    p_birth_date: parsed.value.birth_date,
    p_sex: parsed.value.sex,
    p_weight: parsed.value.birth_weight_g,
    p_height: parsed.value.birth_height_cm,
    p_head: parsed.value.birth_head_cm,
  });
  if (error) redirect("/enfant/naissance?error=save");
  revalidatePath("/", "layout");
  redirect("/enfant/dashboard?bienvenue=1");
}

const ERRORS: Record<string, string> = {
  name: "Indique un prénom de 1 à 80 caractères.",
  date: "Indique une date de naissance valide, aujourd’hui ou dans le passé.",
  sex: "Choisis l’une des options proposées.",
  measurements: "Vérifie les mesures de naissance ou laisse-les vides.",
  save: "L’enregistrement a échoué. Réessaie dans un instant.",
};

export default async function BirthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; parcours?: string }>;
}) {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: profile }, params] = await Promise.all([
    client.from("profiles").select("baby_name").eq("id", user.id).maybeSingle(),
    searchParams,
  ]);
  const older = params.parcours === "enfant";
  return (
    <section className="mx-auto max-w-xl px-5 py-8">
      <div className="mb-7 text-center">
        <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100">
          <Baby className="size-8 text-pink-600" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
          Une nouvelle étape
        </p>
        <h1 className="mt-display mt-2">
          {older ? "Son histoire continue ici" : "Bienvenue à bébé"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          De sa naissance à ses 6 ans, un carnet qui grandit avec votre famille.
          Quelques informations et son espace s’adapte à son âge.
        </p>
      </div>
      {params.error && (
        <Alert tone="danger" className="mb-4">
          {ERRORS[params.error] ?? ERRORS.save}
        </Alert>
      )}
      <form
        action={registerBirth}
        className="space-y-5 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
      >
        <input type="hidden" name="request_id" value={crypto.randomUUID()} />
        <FormField label="Prénom de votre enfant" htmlFor="name" required>
          <Input
            id="name"
            name="name"
            autoComplete="off"
            maxLength={80}
            required
            defaultValue={older ? "" : (profile?.baby_name ?? "")}
            placeholder="Son petit prénom"
          />
        </FormField>
        <FormField label="Date de naissance" htmlFor="birth_date" required>
          <Input
            id="birth_date"
            name="birth_date"
            type="date"
            min="1970-01-01"
            max={todayInParis()}
            required
          />
        </FormField>
        <FormField label="Sexe · facultatif" htmlFor="sex">
          <select
            id="sex"
            name="sex"
            className="min-h-11 w-full rounded-xl border border-border px-3 bg-surface"
          >
            <option value="">Ne pas renseigner</option>
            <option value="F">Fille</option>
            <option value="M">Garçon</option>
            <option value="X">Autre</option>
          </select>
        </FormField>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-foreground">
            Mesures à la naissance{" "}
            <span className="font-normal text-foreground-muted">
              · facultatives
            </span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                name: "birth_weight_g",
                label: "Poids (g)",
                min: 300,
                max: 8000,
                step: 1,
              },
              {
                name: "birth_height_cm",
                label: "Taille (cm)",
                min: 25,
                max: 80,
                step: 0.1,
              },
              {
                name: "birth_head_cm",
                label: "Tour de tête (cm)",
                min: 20,
                max: 50,
                step: 0.1,
              },
            ].map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                htmlFor={field.name}
              >
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                />
              </FormField>
            ))}
          </div>
        </fieldset>
        <Button fullWidth type="submit" size="lg">
          Commencer son suivi <ArrowRight size={16} />
        </Button>
        <p className="flex items-center gap-2 text-xs text-foreground-muted">
          <Heart size={14} className="shrink-0 text-brand" />
          Vos souvenirs et relevés de grossesse restent accessibles.
        </p>
      </form>
      <Link
        href="/enfant/import"
        className="mt-5 block text-center text-sm text-brand underline underline-offset-4"
      >
        J’utilisais déjà BabyTrack : récupérer mon suivi
      </Link>
    </section>
  );
}

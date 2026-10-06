import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Check, Syringe } from "lucide-react";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import ActionButton from "@/components/enfant/ActionButton";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import {
  VACCINES_FR,
  VACCINE_SOURCE,
  vaccineRequirement,
} from "@/lib/enfant/vaccines-fr";
import {
  vaccineCode,
  vaccineRecorded,
  formatDueDateFR,
} from "@/lib/enfant/vaccines-due";
import {
  addCalendarMonths,
  calendarDate,
  parseCalendarDate,
  childAgeMonths,
} from "@/lib/family-journey";
export const metadata = { title: "Son carnet vaccinal" };
async function markVaccineGiven(form: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const role = await getUserRole(user, baby);
  if (
    (role !== "owner" && role !== "caregiver") ||
    form.get("baby_id") !== baby.id
  )
    redirect("/enfant/vaccines?error=access");
  const code = String(form.get("vaccine_code") ?? "");
  const label = VACCINES_FR.flatMap((s) =>
    s.vaccines.map((v) => ({ code: vaccineCode(s.ageMonths, v), label: v })),
  ).find((v) => v.code === code)?.label;
  const date = String(form.get("given_at") ?? "");
  if (
    !label ||
    !parseCalendarDate(date) ||
    date > calendarDate() ||
    date < baby.birth_date
  )
    redirect("/enfant/vaccines?error=date");
  const existing = await supabase
    .from("vaccines_given")
    .select("vaccine_code")
    .eq("baby_id", baby.id);
  if (existing.error) redirect("/enfant/vaccines?error=save");
  if (
    !vaccineRecorded(
      new Set((existing.data ?? []).map((v) => v.vaccine_code)),
      code,
    )
  ) {
    const { error } = await supabase.from("vaccines_given").insert({
      baby_id: baby.id,
      user_id: user.id,
      vaccine_code: code,
      vaccine_label: label,
      given_at: date,
    });
    if (error) redirect("/enfant/vaccines?error=save");
  }
  revalidatePath("/enfant/vaccines");
  revalidatePath("/enfant/dashboard");
}
async function deleteVaccine(form: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const role = await getUserRole(user, baby);
  if (
    (role !== "owner" && role !== "caregiver") ||
    form.get("baby_id") !== baby.id
  )
    redirect("/enfant/vaccines?error=access");
  const { error } = await supabase
    .from("vaccines_given")
    .delete()
    .eq("id", String(form.get("id") ?? ""))
    .eq("baby_id", baby.id);
  if (error) redirect("/enfant/vaccines?error=save");
  revalidatePath("/enfant/vaccines");
}
export default async function VaccinesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const [role, records, params] = await Promise.all([
    getUserRole(user, baby),
    supabase
      .from("vaccines_given")
      .select("id,vaccine_code,vaccine_label,given_at,location,notes")
      .eq("baby_id", baby.id)
      .order("given_at", { ascending: false }),
    searchParams,
  ]);
  if (records.error)
    throw new Error("Le carnet vaccinal est momentanément indisponible.");
  const given = records.data ?? [],
    codes = new Set(given.map((v) => v.vaccine_code)),
    older = childAgeMonths(baby.birth_date) >= 36,
    writable = role === "owner" || role === "caregiver",
    today = calendarDate(),
    birth = parseCalendarDate(baby.birth_date)!;
  const calendar = (olderYears: boolean) => (
    <div className="space-y-4">
      {VACCINES_FR.filter((s) =>
        olderYears ? s.ageMonths >= 36 : s.ageMonths < 36,
      ).map((s) => (
        <section className="mt-card" key={s.ageMonths}>
          <div className="mt-card-header">
            <h2>{s.label}</h2>
            <span className="text-xs text-foreground-muted">
              Repère : {formatDueDateFR(addCalendarMonths(birth, s.ageMonths))}
            </span>
          </div>
          <div className="space-y-4">
            {s.vaccines.map((label) => {
              const code = vaccineCode(s.ageMonths, label),
                done = vaccineRecorded(codes, code);
              return (
                <div
                  key={code}
                  className="rounded-2xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-[11px] text-foreground-muted">
                        {vaccineRequirement(label, baby.birth_date)}
                      </p>
                    </div>
                    <span className="mt-pill">
                      {done ? (
                        <>
                          <Check size={12} />
                          Renseigné
                        </>
                      ) : (
                        "À vérifier"
                      )}
                    </span>
                  </div>
                  {!done && writable && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-brand">
                        Cette dose a été administrée
                      </summary>
                      <form
                        action={markVaccineGiven}
                        className="mt-3 flex flex-wrap items-end gap-2"
                      >
                        <input type="hidden" name="baby_id" value={baby.id} />
                        <input type="hidden" name="vaccine_code" value={code} />
                        <label className="min-w-0 flex-1 text-xs">
                          Date réelle
                          <input
                            name="given_at"
                            type="date"
                            min={baby.birth_date}
                            max={today}
                            required
                            defaultValue={today}
                            className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm"
                          />
                        </label>
                        <ActionButton>Enregistrer</ActionButton>
                      </form>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
  return (
    <ModuleShell
      slug="vaccines"
      title="Son carnet vaccinal"
      subtitle={`${baby.name} · Repères français jusqu’à 6 ans`}
      viewerBadge={role === "viewer"}
    >
      {params.error && (
        <p role="alert" className="mt-note mb-4">
          {params.error === "date"
            ? "Renseignez la date réelle, comprise entre sa naissance et aujourd’hui."
            : params.error === "access"
              ? "Le carnet est en lecture seule, ou l’enfant sélectionné a changé."
              : "L’enregistrement a échoué. Réessayez."}
        </p>
      )}
      <section className="mt-care-card mb-6">
        <Syringe size={22} />
        <h2 className="mt-3">
          Les bons repères.
          <br />
          Un suivi qui reste avec lui.
        </h2>
        <p>
          Calendrier général 2026, mis à jour en septembre. « À vérifier »
          signifie qu’aucune dose n’est renseignée dans l’application. Votre
          médecin adapte le calendrier et les rattrapages.
        </p>
        <a
          href={VACCINE_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-link mt-3"
        >
          Consulter le calendrier officiel →
        </a>
      </section>
      {older && (
        <p className="mt-note mb-5">
          De 3 à 6 ans : vérifiez le carnet existant et préparez le rappel
          DTP-coqueluche-polio à 6 ans. Pour les enfants nés depuis 2023, le
          rattrapage des méningocoques B et ACWY entre 2 et moins de 5 ans se
          discute avec le médecin. La vaccination contre la grippe peut être
          proposée chaque année dès 2 ans.
        </p>
      )}
      {calendar(older)}
      <details className="mt-card mt-6">
        <summary className="cursor-pointer text-sm font-semibold">
          {older
            ? "Retrouver le calendrier des premières années"
            : "Préparer le rappel des 6 ans"}
        </summary>
        <div className="mt-5">{calendar(!older)}</div>
      </details>
      <section className="mt-card mt-6">
        <div className="mt-card-header">
          <h2>Les doses enregistrées</h2>
          <span className="mt-pill">{given.length}</span>
        </div>
        {given.length ? (
          <div className="space-y-4">
            {given.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {v.vaccine_label || v.vaccine_code}
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {formatDueDateFR(parseCalendarDate(v.given_at)!)}
                    {v.location ? ` · ${v.location}` : ""}
                  </p>
                  {v.notes && (
                    <p className="mt-2 text-xs text-foreground-muted">
                      {v.notes}
                    </p>
                  )}
                </div>
                {writable && (
                  <details>
                    <summary className="cursor-pointer text-xs text-foreground-muted">
                      Corriger
                    </summary>
                    <form action={deleteVaccine} className="mt-2">
                      <input type="hidden" name="baby_id" value={baby.id} />
                      <input type="hidden" name="id" value={v.id} />
                      <ActionButton className="mt-button mt-button-secondary !text-xs">
                        Retirer ce relevé
                      </ActionButton>
                    </form>
                  </details>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-empty">
            Renseignez les dates depuis le carnet de santé. Les anciennes doses
            importées restent visibles ici.
          </p>
        )}
      </section>
      <p className="mt-note mt-5">
        Rotavirus : 2 ou 3 doses selon le vaccin, dans une fenêtre d’âge
        limitée. Aucun rattrapage n’est proposé automatiquement.{" "}
        <a
          href="https://www.service-public.gouv.fr/particuliers/vosdroits/F724"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Service Public · Vaccinations
        </a>
        .
      </p>
    </ModuleShell>
  );
}

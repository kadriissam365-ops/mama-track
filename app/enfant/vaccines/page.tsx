import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { VACCINES_FR } from "@/lib/enfant/vaccines-fr";
import { slugify } from "@/lib/enfant/vaccines-due";

export const metadata = { title: "Vaccins — MamaTrack" };

type VaccineGiven = {
  id: string;
  vaccine_code: string;
  vaccine_label: string | null;
  given_at: string;
  dose_number: number | null;
  location: string | null;
  notes: string | null;
};

// Precompute whitelist of accepted vaccine codes derived from the FR schedule.
const VALID_VACCINE_CODES = new Set<string>(
  VACCINES_FR.flatMap((s) =>
    s.vaccines.map((v) => slugify(s.ageMonths + "-" + v)),
  ),
);

async function markVaccineGiven(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const vaccine_code = String(formData.get("vaccine_code") ?? "");
  if (!vaccine_code || !VALID_VACCINE_CODES.has(vaccine_code)) return;

  const vaccine_label =
    String(formData.get("vaccine_label") ?? "").slice(0, 200) || null;

  const given_at_raw = String(formData.get("given_at") ?? "");
  let given_at = new Date().toISOString().slice(0, 10);
  if (given_at_raw) {
    const d = new Date(given_at_raw);
    if (!Number.isNaN(d.getTime())) {
      // Reject dates clearly in the future (> 24 h).
      if (d.getTime() <= Date.now() + 24 * 60 * 60 * 1000) {
        given_at = given_at_raw;
      }
    }
  }

  const locationRaw = String(formData.get("location") ?? "").trim();
  const location = locationRaw ? locationRaw.slice(0, 120) : null;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw.slice(0, 500) : null;

  await saveMutation(supabase.from("vaccines_given").insert({
    baby_id: baby.id,
    user_id: user.id,
    vaccine_code,
    vaccine_label,
    given_at,
    location,
    notes,
  }));
  revalidatePath("/enfant/vaccines");
}

async function deleteVaccine(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase
    .from("vaccines_given")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id));
  revalidatePath("/enfant/vaccines");
}

export default async function VaccinesPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const { data: givenRaw } = await supabase
    .from("vaccines_given")
    .select("id, vaccine_code, vaccine_label, given_at, dose_number, location, notes")
    .eq("baby_id", baby.id)
    .order("given_at", { ascending: false });

  const given = (givenRaw as VaccineGiven[] | null) ?? [];
  const doneCodes = new Set(given.map((v) => v.vaccine_code));

  const today = new Date();
  const birth = new Date(baby.birth_date);
  const ageMonths =
    (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <ModuleShell
      slug="vaccines"
      title="Vaccins"
      subtitle={`${baby.name} — calendrier vaccinal français`}
      viewerBadge={role === "viewer"}
    >
      <div className="mb-6 rounded-2xl border border-info/20 bg-info-soft p-4 text-sm text-info-text">
        📋 Calendrier officiel France — 11 vaccins obligatoires depuis 2018.
        Source : Santé Publique France.
      </div>

      <div className="space-y-4">
        {VACCINES_FR.map((schedule) => {
          const dueDate = new Date(birth);
          dueDate.setMonth(dueDate.getMonth() + schedule.ageMonths);
          const overdue =
            ageMonths > schedule.ageMonths + 1 &&
            schedule.vaccines.some(
              (v) => !doneCodes.has(slugify(schedule.ageMonths + "-" + v)),
            );
          const upcoming =
            !overdue &&
            ageMonths >= schedule.ageMonths - 1 &&
            ageMonths <= schedule.ageMonths + 1;

          return (
            <div
              key={schedule.ageMonths}
              className={`rounded-2xl border bg-surface p-5 shadow-sm ${
                overdue
                  ? "border-danger/40"
                  : upcoming
                    ? "border-brand/40"
                    : "border-border"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">
                    {schedule.label}
                  </div>
                  <div className="text-xs text-foreground-subtle">
                    À faire vers le{" "}
                    {dueDate.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                {overdue && (
                  <span className="rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger-text">
                    En retard
                  </span>
                )}
                {upcoming && (
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-strong">
                    À programmer
                  </span>
                )}
              </div>

              <ul className="space-y-2">
                {schedule.vaccines.map((v) => {
                  const code = slugify(schedule.ageMonths + "-" + v);
                  const done = given.find((g) => g.vaccine_code === code);
                  return (
                    <li
                      key={code}
                      className="flex flex-col gap-2 rounded-xl bg-surface-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        {done ? (
                          <span className="text-foreground-subtle line-through">
                            {v}
                          </span>
                        ) : (
                          <span className="text-foreground">{v}</span>
                        )}
                        {done && (
                          <div className="text-xs text-success">
                            ✅ Fait le{" "}
                            {new Date(done.given_at).toLocaleDateString(
                              "fr-FR",
                            )}
                            {done.location && ` · ${done.location}`}
                          </div>
                        )}
                      </div>
                      {done && canWrite ? (
                        <form action={deleteVaccine} className="self-end sm:self-auto">
                          <input
                            type="hidden"
                            name="id"
                            value={done.id}
                          />
                          <button
                            type="submit"
                            className="text-xs text-foreground-subtle hover:text-danger"
                          >
                            Défaire
                          </button>
                        </form>
                      ) : !done && canWrite ? (
                        <form
                          action={markVaccineGiven}
                          className="flex flex-wrap items-center gap-1"
                        >
                          <input
                            type="hidden"
                            name="vaccine_code"
                            value={code}
                          />
                          <input
                            type="hidden"
                            name="vaccine_label"
                            value={v}
                          />
                          <input
                            type="date"
                            name="given_at"
                            defaultValue={todayStr}
                            aria-label={`Date du vaccin ${v}`}
                            className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1 text-xs text-foreground sm:flex-none"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-strong"
                          >
                            Marquer fait
                          </button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
}

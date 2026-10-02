import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { PushNotificationsPanel } from "@/components/enfant/PushNotificationsPanel";
import { getSubscriptionState } from "@/lib/enfant/subscription";
import { ThemeToggle } from "@/components/enfant/ThemeToggle";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { parseBirth, todayInParis } from "@/lib/enfant/birth-validation";

async function savePreferences(form: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const units = form.get("units") === "imperial" ? "imperial" : "metric";
  const { error } = await supabase.from("baby_preferences").update({ units }).eq("id", user.id);
  if (error) redirect("/enfant/settings?erreur=1");
  revalidatePath("/enfant", "layout");
  redirect("/enfant/settings?enregistre=1");
}
async function saveNotifications(form: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const subscription = await getSubscriptionState();
  const push = form.get("push_reminders") === "true" || form.get("push_reminders") === "on";
  if (push && !subscription?.hasAccess) redirect("/settings?premium=1");
  const patch: Record<string, boolean> = { push_reminders: push };
  if (form.get("email_preferences") === "true") {
    patch.vaccine_email_reminders = form.get("vaccine_email_reminders") === "on";
    patch.monthly_report_email = form.get("monthly_report_email") === "on" && Boolean(subscription?.hasAccess);
  }
  const { error } = await supabase.from("baby_preferences").update(patch).eq("id", user.id);
  if (error) redirect("/enfant/settings?erreur=1");
  revalidatePath("/enfant/settings");
  redirect("/enfant/settings?enregistre=1");
}
async function saveBaby(form: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby || baby.user_id !== user.id) redirect("/enfant/settings?erreur=1");
  const result = parseBirth(form);
  if (result.error) redirect("/enfant/settings?erreur=1");
  const { error } = await supabase.from("babies").update(result.value).eq("id", baby.id).eq("user_id", user.id);
  if (error) redirect("/enfant/settings?erreur=1");
  revalidatePath("/", "layout");
  redirect("/enfant/settings?enregistre=1");
}

export default async function Settings({ searchParams }: { searchParams: Promise<{ erreur?: string; enregistre?: string }> }) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const [preferences, params, role] = await Promise.all([
    supabase.from("baby_preferences").select("units,vaccine_email_reminders,push_reminders,monthly_report_email").eq("id", user.id).maybeSingle(),
    searchParams,
    baby ? getUserRole(user, baby) : Promise.resolve(null),
  ]);
  const subscription = await getSubscriptionState();
  const emailReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const pushReady = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
  const field = "w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm";
  const button = "rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white";
  return <ModuleShell title="Réglages du carnet" slug="settings" subtitle="Les préférences de ta famille, réunies au même endroit">
    {params.erreur && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">Enregistrement impossible. Vérifie les informations et réessaie.</p>}
    {params.enregistre && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-green-800">Les modifications ont été enregistrées.</p>}
    <section className="mb-5 space-y-4 rounded-3xl border border-border bg-surface p-5">
      <h2 className="font-semibold">Affichage</h2><ThemeToggle />
      <form action={savePreferences} className="space-y-3">
        <label className="block text-sm">Unités<select name="units" defaultValue={preferences.data?.units ?? "metric"} className={field}><option value="metric">Grammes et centimètres</option><option value="imperial">Livres et pouces</option></select></label>
        <button className={button}>Enregistrer les préférences</button>
      </form>
    </section>
    {baby && role === "owner" && <section className="mb-5 rounded-3xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-semibold">Le profil de {baby.name}</h2>
      <form action={saveBaby} className="space-y-4">
        <label className="block text-sm">Prénom<input name="name" required maxLength={80} defaultValue={baby.name} className={field} /></label>
        <label className="block text-sm">Date de naissance<input name="birth_date" type="date" required max={todayInParis()} defaultValue={baby.birth_date} className={field} /></label>
        <label className="block text-sm">Sexe<select name="sex" defaultValue={baby.sex ?? "X"} className={field}><option value="X">Non renseigné</option><option value="F">Fille</option><option value="M">Garçon</option></select></label>
        <div className="grid gap-3 sm:grid-cols-3">{[["birth_weight_g", "Poids à la naissance (g)", baby.birth_weight_g], ["birth_height_cm", "Taille (cm)", baby.birth_height_cm], ["birth_head_cm", "Périmètre crânien (cm)", baby.birth_head_cm]].map(([name, label, value]) => <label key={String(name)} className="text-sm">{label}<input name={String(name)} type="number" step={name === "birth_weight_g" ? "1" : "0.1"} min="0" defaultValue={value ?? ""} className={field} /></label>)}</div>
        <button className={button}>Enregistrer le profil</button>
      </form>
    </section>}
    {(emailReady || pushReady) && <section className="mb-5 space-y-4 rounded-3xl border border-border bg-surface p-5">
      <h2 className="font-semibold">Rappels du carnet</h2>
      {emailReady && <form action={saveNotifications} className="space-y-3">
        <input type="hidden" name="email_preferences" value="true" /><input type="hidden" name="push_reminders" value={String(preferences.data?.push_reminders ?? false)} />
        <label className="flex gap-2 text-sm"><input type="checkbox" name="vaccine_email_reminders" defaultChecked={preferences.data?.vaccine_email_reminders} />Rappels de vaccination par email</label>
        {subscription?.hasAccess && <label className="flex gap-2 text-sm"><input type="checkbox" name="monthly_report_email" defaultChecked={preferences.data?.monthly_report_email} />Bilan mensuel par email</label>}
        <button className={button}>Enregistrer les rappels</button>
      </form>}
      {pushReady && (subscription?.hasAccess ? <PushNotificationsPanel optIn={preferences.data?.push_reminders ?? false} onOptInChange={saveNotifications} /> : <Link href="/settings?premium=1" className="block text-sm text-brand-strong">Découvrir les notifications avec Premium →</Link>)}
    </section>}
    <div className="space-y-3 rounded-3xl border border-border bg-surface p-5">
      <Link href="/enfant/duo" className="block font-medium text-brand-strong">Partager le carnet avec un proche →</Link>
      <Link href="/enfant/import" className="block font-medium text-brand-strong">Transférer mon ancien carnet BabyTrack →</Link>
      <Link href="/settings" className="block font-medium text-brand-strong">Compte, consentement IA, abonnement et suppression →</Link>
    </div>
  </ModuleShell>;
}

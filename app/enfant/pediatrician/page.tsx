import { redirect } from "next/navigation";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getCachedUser } from "@/lib/enfant/baby";
import { APP_URL } from "@/lib/enfant/constants";
import { Alert } from "@/components/enfant/ui";
import { TokenCard } from "@/components/enfant/pediatrician/TokenCard";
import { createPediatricianToken } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mode pédiatre — MamaTrack" };

type PediTokenRow = {
  id: string;
  token: string;
  scope_months: number;
  include_diary: boolean;
  label: string | null;
  expires_at: string;
  revoked_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
  created_at: string;
};

export default async function PediatricianPage() {
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const { baby, supabase } = await requireUserAndBaby(user);
  if (!baby) redirect("/enfant/onboarding");
  const requestNow = new Date().getTime();

  const isOwner = baby.user_id === user.id;

  const { data: tokensRaw } = await supabase
    .from("pediatrician_tokens")
    .select(
      "id, token, scope_months, include_diary, label, expires_at, revoked_at, last_accessed_at, access_count, created_at",
    )
    .eq("baby_id", baby.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const tokens = (tokensRaw as PediTokenRow[] | null) ?? [];
  const nowMs = requestNow;
  const active = tokens.filter(
    (t) => !t.revoked_at && new Date(t.expires_at).getTime() > nowMs,
  );
  const inactive = tokens
    .filter((t) => t.revoked_at || new Date(t.expires_at).getTime() <= nowMs)
    .slice(0, 5);

  return (
    <ModuleShell
      slug="pediatrician"
      title="Mode pédiatre"
      subtitle={`Partage temporaire et sécurisé du dossier médical de ${baby.name} avec un professionnel de santé.`}
    >
      {!isOwner ? (
        <Alert tone="info" icon="🔒">
          Seul le parent propriétaire du suivi peut générer un lien pédiatre.
        </Alert>
      ) : (
        <>
          {/* Liens actifs */}
          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Mes liens actifs ({active.length})
            </h2>
            {active.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-foreground-muted">
                Aucun lien actif. Crée un lien ci-dessous pour partager avec ton
                pédiatre.
              </div>
            ) : (
              <div className="bt-stagger space-y-3">
                {active.map((t) => (
                  <TokenCard
                    key={t.id}
                    id={t.id}
                    url={`${APP_URL}/enfant/p/${t.token}`}
                    label={t.label}
                    expiresAt={t.expires_at}
                    scopeMonths={t.scope_months}
                    includeDiary={t.include_diary}
                    accessCount={t.access_count}
                    lastAccessedAt={t.last_accessed_at}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Création */}
          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Créer un nouveau lien
            </h2>
            <form
              action={createPediatricianToken}
              className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"
            >
              <div>
                <label
                  htmlFor="pedi-label"
                  className="mb-1.5 block text-xs font-medium text-foreground"
                >
                  Nom du lien
                  <span className="text-foreground-subtle"> (visible côté parent uniquement)</span>
                </label>
                <input
                  id="pedi-label"
                  name="label"
                  type="text"
                  required
                  maxLength={80}
                  placeholder="Dr Martin, RDV pédiatre 12 mai…"
                  className="block h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-foreground">
                  Données partagées
                </span>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 6, 12].map((m) => (
                    <label
                      key={m}
                      className="cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="scope_months"
                        value={m}
                        defaultChecked={m === 6}
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:border-border-strong hover:text-foreground peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2">
                        {m} {m === 1 ? "mois" : "mois"}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-foreground-subtle">
                  Mesures, vaccins, allergies, événements santé et étapes des N
                  derniers mois.
                </p>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-foreground">
                  Durée du lien
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { d: 1, lbl: "1 jour" },
                    { d: 7, lbl: "7 jours" },
                    { d: 30, lbl: "30 jours" },
                  ].map(({ d, lbl }) => (
                    <label key={d} className="cursor-pointer">
                      <input
                        type="radio"
                        name="duration_days"
                        value={d}
                        defaultChecked={d === 7}
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:border-border-strong hover:text-foreground peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2">
                        {lbl}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5">
                <input
                  type="checkbox"
                  name="include_diary"
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border text-brand focus:ring-brand"
                />
                <span className="flex-1 text-xs text-foreground">
                  <span className="font-medium">Inclure le journal personnel</span>
                  <span className="block text-[11px] text-foreground-subtle">
                    Décoché : seules les données médicales sont partagées (recommandé).
                  </span>
                </span>
              </label>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                Créer le lien sécurisé
              </button>
            </form>
          </section>

          {/* Historique */}
          {inactive.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Liens récents (expirés / révoqués)
              </h2>
              <ul className="space-y-2">
                {inactive.map((t) => {
                  const isRevoked = !!t.revoked_at;
                  return (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs shadow-sm"
                    >
                      <span className="flex-1 truncate font-medium text-foreground-muted">
                        {t.label ?? "Lien sans nom"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isRevoked
                            ? "bg-danger-soft text-danger-text"
                            : "bg-surface-muted text-foreground-muted"
                        }`}
                      >
                        {isRevoked ? "Révoqué" : "Expiré"}
                      </span>
                      <span className="text-foreground-subtle">
                        {t.access_count} accès
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <Alert tone="info" icon="🔒">
            Le pédiatre verra : âge, mesures (courbes), vaccins, allergies,
            événements santé, étapes
            {tokens.some((t) => t.include_diary) ? " et le journal si activé" : ""}.
            Il ne pourra rien modifier ni voir tes données personnelles
            (email, abonnement, identité parentale).
          </Alert>
        </>
      )}
    </ModuleShell>
  );
}

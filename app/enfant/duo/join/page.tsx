import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/enfant/supabase/server";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { ModuleShell } from "@/components/enfant/ModuleShell";

type SearchParams = Promise<{ token?: string; code?: string }>;

const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;

async function acceptInvitation(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const token = String(formData.get("token") ?? "").trim();
  if (!token || !TOKEN_RE.test(token)) redirect("/enfant/dashboard?invite=invalid");

  const { error } = await supabase.rpc("accept_baby_invitation", { p_token: token });
  if (error) redirect("/enfant/dashboard?invite=invalid");

  revalidatePath("/enfant/dashboard");
  redirect("/enfant/dashboard?invite=ok");
}

export default async function DuoJoinPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = params.token ?? params.code;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!token || !TOKEN_RE.test(token)) {
    return (
      <ModuleShell slug="duo" title="Invitation">
        <div className="rounded-2xl border border-danger/30 bg-danger-soft p-6 text-sm text-danger-text">
          Lien d&apos;invitation invalide ou expiré. Demande un nouveau lien à
          la personne qui t&apos;a invité(e).
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/enfant/dashboard"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </ModuleShell>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`/enfant/duo/join?token=${token}`);
    return (
      <ModuleShell
        icon="💌"
        title="Tu es invité(e)"
        subtitle="Rejoins l'espace suivi bébé de quelqu'un qui compte pour toi"
      >
        <div className="rounded-2xl border border-border bg-brand-soft/40 p-6">
          <p className="mb-4 text-sm text-foreground-muted">
            Connecte-toi ou crée un compte pour accepter l&apos;invitation.
            Après connexion, tu reviendras automatiquement sur cette page.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/auth/login?next=${next}`}
              className="rounded-xl bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              J&apos;ai déjà un compte
            </Link>
            <Link
              href={`/auth/signup?next=${next}`}
              className="rounded-xl border border-brand/40 bg-surface px-5 py-2.5 text-center text-sm font-semibold text-brand-strong transition hover:bg-brand-soft"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </ModuleShell>
    );
  }

  const service = createServiceClient();
  const { data: inv } = await service
    .from("baby_invitations")
    .select("id, baby_id, owner_id, role, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (!inv) {
    return (
      <ModuleShell slug="duo" title="Invitation introuvable">
        <div className="rounded-2xl border border-danger/30 bg-danger-soft p-6 text-sm text-danger-text">
          Cette invitation n&apos;existe plus ou le lien est incorrect.
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/enfant/dashboard"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </ModuleShell>
    );
  }

  if (inv.used_at) {
    return (
      <ModuleShell slug="duo" title="Lien déjà utilisé">
        <div className="rounded-2xl border border-warning/30 bg-warning-soft p-6 text-sm text-warning-text">
          Ce lien d&apos;invitation a déjà été accepté. Demande un nouveau lien
          à la personne qui t&apos;a invité(e).
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/enfant/dashboard"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </ModuleShell>
    );
  }

  if (new Date(inv.expires_at) < new Date()) {
    return (
      <ModuleShell slug="duo" title="Lien expiré">
        <div className="rounded-2xl border border-warning/30 bg-warning-soft p-6 text-sm text-warning-text">
          Ce lien d&apos;invitation a expiré. Demande un nouveau lien à la
          personne qui t&apos;a invité(e).
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/enfant/dashboard"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </ModuleShell>
    );
  }

  if (inv.owner_id === user.id) {
    redirect("/enfant/dashboard");
  }

  const { data: baby } = await service
    .from("babies")
    .select("id, name")
    .eq("id", inv.baby_id)
    .maybeSingle();

  const invRole = inv.role === "viewer" ? "viewer" : "caregiver";
  const roleLabel =
    invRole === "viewer" ? "lecteur (lecture seule)" : "co-parent (lecture + écriture)";
  const roleSubtitle =
    invRole === "viewer"
      ? "Tu pourras consulter le suivi en temps réel — sans pouvoir ajouter ni modifier."
      : "Tu auras accès au même journal que le/la propriétaire — biberons, sommeil, couches, etc.";

  return (
    <ModuleShell
      icon="💌"
      title={`Rejoindre le suivi de ${baby?.name ?? "ce bébé"}`}
      subtitle={roleSubtitle}
    >
      <form
        action={acceptInvitation}
        className="rounded-2xl border border-border bg-brand-soft/40 p-6"
      >
        <input type="hidden" name="token" value={token} />
        <div className="mb-4 flex items-center gap-3">
          <div className="text-4xl">👶</div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              {baby?.name ?? "Bébé"}
            </div>
            <div className="text-xs text-foreground-subtle">
              Tu vas rejoindre en tant que {roleLabel}.
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          ✅ Accepter l&apos;invitation
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link
          href="/enfant/dashboard"
          className="text-sm text-foreground-muted hover:text-foreground"
        >
          Annuler
        </Link>
      </div>
    </ModuleShell>
  );
}

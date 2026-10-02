import { saveMutation } from "@/lib/enfant/mutations";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby } from "@/lib/enfant/baby";
import { createServiceClient } from "@/lib/enfant/supabase/service";
import { APP_URL } from "@/lib/enfant/constants";
import { CopyInviteLink } from "./CopyInviteLink";
import { Alert, Badge } from "@/components/enfant/ui";

export const metadata = { title: "Mode duo — MamaTrack" };

type CollabRole = "caregiver" | "viewer";

type Collaborator = {
  id: string;
  collaborator_id: string;
  owner_id: string;
  role: CollabRole;
  accepted_at: string | null;
  created_at: string;
};

type Invitation = {
  id: string;
  token: string;
  role: CollabRole;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
};

const TOKEN_BYTES = 24;

function genToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

function normalizeRole(raw: unknown): CollabRole {
  return raw === "viewer" ? "viewer" : "caregiver";
}

function inviteUrl(token: string): string {
  return `${APP_URL}/enfant/duo/join?token=${token}`;
}

// =====================
// Server actions
// =====================

async function createInvitation(formData: FormData) {
  "use server";
  const { user, baby } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  if (baby.user_id !== user.id) return; // owner only

  const role = normalizeRole(formData.get("role"));

  const service = createServiceClient();
  await saveMutation(service.from("baby_invitations").insert({
    baby_id: baby.id,
    owner_id: user.id,
    token: genToken(),
    role,
  }));

  revalidatePath("/enfant/duo");
}

async function revokeInvitation(formData: FormData) {
  "use server";
  const { user, baby } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  if (baby.user_id !== user.id) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const service = createServiceClient();
  await saveMutation(service
    .from("baby_invitations")
    .delete()
    .eq("id", id)
    .eq("baby_id", baby.id)
    .eq("owner_id", user.id));

  revalidatePath("/enfant/duo");
}

async function updateCollaboratorRole(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  if (baby.user_id !== user.id) return;

  const id = String(formData.get("id") ?? "");
  const role = normalizeRole(formData.get("role"));
  if (!id) return;

  await saveMutation(supabase
    .from("baby_collaborators")
    .update({ role })
    .eq("id", id)
    .eq("baby_id", baby.id)
    .eq("owner_id", user.id));

  revalidatePath("/enfant/duo");
}

async function removeCollaborator(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  if (baby.user_id !== user.id) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await saveMutation(supabase
    .from("baby_collaborators")
    .delete()
    .eq("id", id)
    .eq("baby_id", baby.id)
    .eq("owner_id", user.id));

  revalidatePath("/enfant/duo");
}

// =====================
// Page
// =====================

export default async function DuoPage() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const isOwner = baby.user_id === user.id;

  const { data: rawCollabs } = await supabase
    .from("baby_collaborators")
    .select("id, collaborator_id, owner_id, role, accepted_at, created_at")
    .eq("baby_id", baby.id)
    .order("created_at", { ascending: true });
  const collabs = ((rawCollabs as Collaborator[] | null) ?? []).map((c) => ({
    ...c,
    role: normalizeRole(c.role),
  }));

  // Lookup profiles (email/full_name) pour afficher qui est qui.
  // Service client pour bypass RLS sur profiles d'autres users.
  const collabIds = collabs.map((c) => c.collaborator_id);
  const profilesById = new Map<string, Profile>();
  if (isOwner && collabIds.length > 0) {
    const service = createServiceClient();
    const { data: profs } = await service
      .from("baby_preferences")
      .select("id, email, full_name")
      .in("id", collabIds);
    for (const p of (profs as Profile[] | null) ?? []) {
      profilesById.set(p.id, p);
    }
  }

  let pendingInvites: Invitation[] = [];
  if (isOwner) {
    const service = createServiceClient();
    const nowIso = new Date().toISOString();
    const { data: invs } = await service
      .from("baby_invitations")
      .select("id, token, role, expires_at, used_at, created_at")
      .eq("baby_id", baby.id)
      .eq("owner_id", user.id)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false });
    pendingInvites = ((invs as Invitation[] | null) ?? []).map((i) => ({
      ...i,
      role: normalizeRole(i.role),
    }));
  }

  return (
    <ModuleShell
      slug="duo"
      title="Famille & proches"
      subtitle={
        isOwner
          ? `Invite ta famille à suivre ${baby.name} — co-parent ou simple lecteur`
          : `Tu accèdes au suivi de ${baby.name} en tant que collaborateur`
      }
    >
      {isOwner ? (
        <>
          <RoleLegend />

          <SectionHeading>Mes collaborateurs ({collabs.length})</SectionHeading>
          {collabs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
              Personne n&apos;a encore rejoint ton espace. Génère un lien
              ci-dessous pour inviter quelqu&apos;un.
            </div>
          ) : (
            <ul className="bt-stagger space-y-2">
              {collabs.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm transition hover:border-border-strong"
                >
                  <div aria-hidden className="text-2xl">
                    {c.role === "caregiver" ? "👨‍👩‍👧" : "👴"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {profilesById.get(c.collaborator_id)?.full_name ||
                        profilesById.get(c.collaborator_id)?.email ||
                        "Utilisateur"}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
                      <Badge tone={c.role === "caregiver" ? "brand" : "info"} size="sm">
                        {c.role === "caregiver" ? "Co-parent" : "Lecture seule"}
                      </Badge>
                      <span>
                        {c.accepted_at
                          ? `Rejoint le ${new Date(c.accepted_at).toLocaleDateString("fr-FR")}`
                          : "En attente"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={updateCollaboratorRole}>
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={c.role === "caregiver" ? "viewer" : "caregiver"}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                      >
                        {c.role === "caregiver"
                          ? "→ Lecture seule"
                          : "→ Co-parent"}
                      </button>
                    </form>
                    <form action={removeCollaborator}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        aria-label="Retirer ce collaborateur"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                      >
                        🗑
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <SectionHeading className="mt-8">Inviter quelqu&apos;un</SectionHeading>
          <form
            action={createInvitation}
            className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-soft via-surface to-accent-soft/40 p-5 shadow-sm sm:p-6"
          >
            <fieldset className="mb-4">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                Quel rôle veux-tu donner ?
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <RoleRadio
                  name="role"
                  value="caregiver"
                  defaultChecked
                  emoji="👨‍👩"
                  title="Co-parent"
                  desc="Lecture + écriture (peut tout ajouter / modifier)"
                />
                <RoleRadio
                  name="role"
                  value="viewer"
                  emoji="👴👵"
                  title="Famille / nounou"
                  desc="Lecture seule (peut consulter mais pas modifier)"
                />
              </div>
            </fieldset>
            <button
              type="submit"
              className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              💌 Générer un lien d&apos;invitation
            </button>
          </form>

          <SectionHeading className="mt-8">
            Invitations en attente ({pendingInvites.length})
          </SectionHeading>
          {pendingInvites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-foreground-muted">
              Aucune invitation active. Les liens générés s&apos;afficheront ici
              jusqu&apos;à leur acceptation ou expiration.
            </div>
          ) : (
            <ul className="bt-stagger space-y-3">
              {pendingInvites.map((inv) => {
                const url = inviteUrl(inv.token);
                const expires = new Date(inv.expires_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                });
                return (
                  <li
                    key={inv.id}
                    className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge tone={inv.role === "caregiver" ? "brand" : "info"} size="sm">
                        {inv.role === "caregiver" ? "Co-parent" : "Lecture seule"}
                      </Badge>
                      <span className="text-xs text-foreground-muted">
                        Expire le {expires}
                      </span>
                      <form action={revokeInvitation} className="ml-auto">
                        <input type="hidden" name="id" value={inv.id} />
                        <button
                          type="submit"
                          className="rounded-full px-3 py-1 text-xs text-foreground-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                        >
                          Révoquer
                        </button>
                      </form>
                    </div>
                    <CopyInviteLink url={url} />
                  </li>
                );
              })}
            </ul>
          )}

          <Alert tone="warning" icon="🔒" className="mt-8">
            Sécurité&nbsp;: chaque lien d&apos;invitation est à usage unique et
            expire au bout de 7 jours. Tu peux le révoquer à tout moment.
          </Alert>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-foreground-muted shadow-sm">
          Tu accèdes à ce suivi en tant que collaborateur. Pour gérer les
          invitations et les rôles, demande au/à la propriétaire.
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/enfant/dashboard"
          className="text-sm text-foreground-muted transition hover:text-foreground"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </ModuleShell>
  );
}

function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}

function RoleLegend() {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand/30 bg-brand-soft/40 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-brand-strong">
          <span aria-hidden>👨‍👩</span> Co-parent
        </div>
        <p className="text-xs text-foreground-muted">
          Peut tout faire : ajouter repas, sommeil, mesures, photos, journal —
          comme l&apos;auteur du compte.
        </p>
      </div>
      <div className="rounded-2xl border border-info/30 bg-info-soft/40 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-info-text">
          <span aria-hidden>👴👵</span> Famille / nounou
        </div>
        <p className="text-xs text-foreground-muted">
          Peut consulter le suivi en temps réel mais ne peut rien ajouter ni
          modifier.
        </p>
      </div>
    </div>
  );
}

function RoleRadio({
  name,
  value,
  emoji,
  title,
  desc,
  defaultChecked,
}: {
  name: string;
  value: string;
  emoji: string;
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-brand/50 has-[:checked]:border-brand has-[:checked]:bg-brand-soft/30">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 accent-brand"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          <span aria-hidden className="mr-1">
            {emoji}
          </span>
          {title}
        </span>
        <span className="block text-xs text-foreground-muted">{desc}</span>
      </span>
    </label>
  );
}

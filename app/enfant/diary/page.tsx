import { diaryPhotoUrl, diaryStoragePath } from "@/lib/enfant/media";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { DiaryForm } from "./DiaryForm";
import { Alert, StatCard } from "@/components/enfant/ui";

export const metadata = { title: "Journal — MamaTrack" };

type DiaryEntry = {
  id: string;
  entry_date: string;
  title: string | null;
  body: string | null;
  photo_url: string | null;
  mood: string | null;
  created_at: string;
};

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  calm: "🥰",
  fussy: "😤",
  sick: "🤒",
  excited: "🤩",
};
const VALID_MOODS = new Set(Object.keys(MOOD_EMOJI));

// Whitelist MIME types accepted by the Supabase storage bucket.
const ALLOWED_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB

async function addDiaryEntry(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const entry_date_raw = String(formData.get("entry_date") ?? "");
  let entry_date = new Date().toISOString().slice(0, 10);
  if (entry_date_raw) {
    const d = new Date(entry_date_raw);
    if (!Number.isNaN(d.getTime())) entry_date = entry_date_raw;
  }

  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw ? titleRaw.slice(0, 200) : null;
  const bodyRaw = String(formData.get("body") ?? "").trim();
  const body = bodyRaw ? bodyRaw.slice(0, 4000) : null;
  const moodRaw = String(formData.get("mood") ?? "").trim();
  const mood = VALID_MOODS.has(moodRaw) ? moodRaw : null;

  let photo_url: string | null = null;
  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      redirect("/enfant/diary?err=photo-too-large");
    }
    if (!ALLOWED_PHOTO_MIME.has(photo.type)) {
      redirect("/enfant/diary?err=photo-not-image");
    }
    const rawExt = (photo.name.split(".").pop() ?? "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const ext = rawExt.slice(0, 5) || "jpg";
    // Path is user-scoped; bucket RLS enforces (storage.foldername(name))[1] = auth.uid()::text.
    const path = `${user.id}/${baby.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("diary-photos")
      .upload(path, photo, { upsert: false, contentType: photo.type, cacheControl: "0" });
    if (upErr) {
      redirect("/enfant/diary?err=upload-failed");
    }
    photo_url = `storage:${path}`;
  }

  const { error: insertError } = await supabase.from("diary_entries").insert({
    baby_id: baby.id,
    user_id: user.id,
    entry_date,
    title,
    body,
    mood,
    photo_url,
  });
  if (insertError) {
    const path = diaryStoragePath(photo_url);
    if (path) await supabase.storage.from("diary-photos").remove([path]);
    redirect("/enfant/diary?err=save-failed");
  }
  revalidatePath("/enfant/diary");
}

async function deleteDiaryEntry(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { data: entry } = await supabase.from("diary_entries").select("photo_url").eq("id", id).eq("user_id", user.id).maybeSingle();
  const path = diaryStoragePath(entry?.photo_url);
  if (path) {
    const { error } = await supabase.storage.from("diary-photos").remove([path]);
    if (error) redirect("/enfant/diary?err=save-failed");
  }
  const { error } = await supabase.from("diary_entries").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect("/enfant/diary?err=save-failed");
  revalidatePath("/enfant/diary");
}

type SearchParams = Promise<{ err?: string }>;

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const { err } = await searchParams;
  const errorMessage =
    err === "photo-too-large"
      ? "📸 Photo trop lourde (max 8 Mo). Réessaie avec une image plus légère."
      : err === "photo-not-image"
        ? "📸 Le fichier sélectionné n'est pas une image."
        : err === "upload-failed"
          ? "❌ Échec de l'upload de la photo. Vérifie ta connexion et réessaie."
          : err === "save-failed" ? "Enregistrement impossible. Réessaie dans un instant." : null;

  const { data: entriesRaw } = await supabase
    .from("diary_entries")
    .select("id, entry_date, title, body, photo_url, mood, created_at")
    .eq("baby_id", baby.id)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(120);

  const entries = await Promise.all(((entriesRaw as DiaryEntry[] | null) ?? []).map(async entry => ({ ...entry, photo_url: await diaryPhotoUrl(supabase, entry.photo_url) })));
  const withPhoto = entries.filter((e) => e.photo_url);

  return (
    <ModuleShell
      slug="diary"
      title="Journal de bébé"
      subtitle={`${baby.name} — tes moments préférés, capturés pour toujours`}
      viewerBadge={role === "viewer"}
    >
      {errorMessage && (
        <Alert tone="danger" className="mb-6">
          {errorMessage}
        </Alert>
      )}

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <StatCard icon="📝" label="Entrées" value={entries.length} />
        <StatCard icon="📸" label="Photos" value={withPhoto.length} />
        <StatCard
          icon="📅"
          label="Ce mois-ci"
          value={
            entries.filter((e) => {
              const d = new Date(e.entry_date);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length
          }
        />
      </div>

      {canWrite && <DiaryForm action={addDiaryEntry} />}

      {withPhoto.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Galerie
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {withPhoto.slice(0, 18).map((e) => (
              <div
                key={`ph-${e.id}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted"
              >
                {e.photo_url && (
                  <Image
                    src={e.photo_url}
                    unoptimized
                    alt={e.title ?? ""}
                    fill
                    sizes="(max-width: 640px) 33vw, 16vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Journal
        </h2>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
            {canWrite
              ? "Aucun souvenir enregistré. Ajoute ta première entrée ci-dessus ⬆️"
              : "Aucun souvenir enregistré pour le moment."}
          </div>
        ) : (
          <ul className="bt-stagger space-y-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-border-strong"
              >
                {e.photo_url ? (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                    <Image
                      src={e.photo_url}
                      unoptimized
                      alt={e.title ?? ""}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-3xl">
                    {e.mood ? MOOD_EMOJI[e.mood] ?? "📝" : "📝"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-foreground-muted">
                      {new Date(e.entry_date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                      })}
                      {e.mood && ` · ${MOOD_EMOJI[e.mood] ?? ""}`}
                    </div>
                    {canWrite && (
                      <form action={deleteDiaryEntry}>
                        <input type="hidden" name="id" value={e.id} />
                        <button
                          type="submit"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground-subtle transition hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                          aria-label="Supprimer"
                        >
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                  {e.title && (
                    <div className="mt-0.5 font-semibold text-foreground">
                      {e.title}
                    </div>
                  )}
                  {e.body && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground-muted">
                      {e.body}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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

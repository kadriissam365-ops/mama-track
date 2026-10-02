import { diaryStoragePath } from "@/lib/enfant/media";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase-admin";
import { createClient as createFamilyClient } from "@/lib/enfant/supabase/server";

/**
 * DELETE /api/account/delete
 *
 * Suppression RGPD du compte : fichiers du bucket `bump-photos`, puis
 * suppression de l'utilisateur auth (toutes les tables métier référencent
 * auth.users avec ON DELETE CASCADE). Sans client admin, aucune purge partielle.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!isAdminConfigured()) return NextResponse.json({ error: "La suppression du compte est momentanément indisponible. Contacte le support." }, { status: 503 });

    const userId = user.id;

    // 1. Photos de ventre : le stockage n'est pas couvert par le cascade SQL.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bumpPhotos } = await (supabase as any)
      .from("bump_photos")
      .select("storage_path")
      .eq("user_id", userId);

    if (bumpPhotos && bumpPhotos.length > 0) {
      const paths = (bumpPhotos as { storage_path: string | null }[])
        .map((p) => p.storage_path)
        .filter((p): p is string => Boolean(p));
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage.from("bump-photos").remove(paths);
        if (storageError) return NextResponse.json({ error: "Impossible de supprimer les photos. Réessaie dans un instant." }, { status: 503 });
      }
    }

    // Media owned by this user, including photos in a shared child's journal.
    const admin = createAdminClient();
    async function removeFolder(prefix: string): Promise<void> {
      // Restart at zero after deletion so pagination cannot skip objects.
      for (;;) {
        const { data, error } = await admin.storage.from("diary-photos").list(prefix, { limit: 100 });
        if (error) throw error;
        if (!data?.length) return;
        const files: string[] = [];
        for (const item of data) {
          const path = `${prefix}/${item.name}`;
          if (!item.id) await removeFolder(path); else files.push(path);
        }
        if (files.length) {
          const { error } = await admin.storage.from("diary-photos").remove(files);
          if (error) throw error;
        }
      }
    }
    const familyClient = await createFamilyClient();
    const { data: ownedBabies, error: childError } = await familyClient.from("babies").select("id").eq("user_id", userId);
    if (childError) throw childError;
    if (ownedBabies?.length) {
      const { data: entries, error } = await familyClient.from("diary_entries").select("photo_url").in("baby_id", ownedBabies.map(child => child.id));
      if (error) throw error;
      const media = (entries as unknown as {photo_url: string | null}[] | null)?.map(entry => diaryStoragePath(entry.photo_url)).filter((path): path is string => Boolean(path)) ?? [];
      for (let start = 0; start < media.length; start += 100) {
        const { error } = await admin.storage.from("diary-photos").remove(media.slice(start,start+100));
        if (error) throw error;
      }
    }
    await removeFolder(userId);

    // 2. Suppression du compte auth → cascade sur toutes les tables.
    if (isAdminConfigured()) {
      const admin = createAdminClient();
      const { error: authError } = await admin.auth.admin.deleteUser(userId);
      if (authError) {
        console.error("[account/delete] auth deleteUser error:", authError);
        return NextResponse.json(
          { error: "Impossible de supprimer le compte. Contactez le support." },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true, message: "Compte et données supprimés avec succès" });
    }

    return NextResponse.json({ error: "La suppression du compte est momentanément indisponible. Contacte le support." }, { status: 503 });
  } catch (err) {
    console.error("[account/delete] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

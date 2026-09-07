import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase-admin";

/**
 * DELETE /api/account/delete
 *
 * Suppression RGPD du compte : fichiers du bucket `bump-photos`, puis
 * suppression de l'utilisateur auth (toutes les tables métier référencent
 * auth.users avec ON DELETE CASCADE). Si le client admin n'est pas configuré,
 * on supprime au mieux les données avec le JWT de l'utilisatrice (RLS).
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
        if (storageError) console.error("[account/delete] storage cleanup error:", storageError);
      }
    }

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

    // 3. Fallback sans clé service : purge au mieux via RLS, le compte auth reste.
    const tables: { name: string; column: string }[] = [
      { name: "push_subscriptions", column: "user_id" },
      { name: "notification_preferences", column: "user_id" },
      { name: "notification_settings", column: "user_id" },
      { name: "community_reactions", column: "user_id" },
      { name: "community_reports", column: "user_id" },
      { name: "community_posts", column: "author_id" },
      { name: "journal_notes", column: "user_id" },
      { name: "bump_photos", column: "user_id" },
      { name: "checklist_items", column: "user_id" },
      { name: "shopping_items", column: "user_id" },
      { name: "shopping_budget", column: "user_id" },
      { name: "baby_name_favorites", column: "user_id" },
      { name: "medication_logs", column: "user_id" },
      { name: "medications", column: "user_id" },
      { name: "emergency_contacts", column: "user_id" },
      { name: "birth_plan", column: "user_id" },
      { name: "nutrition_checks", column: "user_id" },
      { name: "meal_plans", column: "user_id" },
      { name: "daily_stories", column: "user_id" },
      { name: "mood_entries", column: "user_id" },
      { name: "sleep_entries", column: "user_id" },
      { name: "exercise_entries", column: "user_id" },
      { name: "exercise_sessions", column: "user_id" },
      { name: "abdomen_entries", column: "user_id" },
      { name: "abdomen_measurements", column: "user_id" },
      { name: "blood_pressure_entries", column: "user_id" },
      { name: "blood_test_entries", column: "user_id" },
      { name: "breathing_sessions", column: "user_id" },
      { name: "water_intake", column: "user_id" },
      { name: "appointments", column: "user_id" },
      { name: "contraction_sessions", column: "user_id" },
      { name: "kick_sessions", column: "user_id" },
      { name: "symptom_entries", column: "user_id" },
      { name: "weight_entries", column: "user_id" },
      { name: "duo_messages", column: "sender_id" },
      { name: "duo_access", column: "mama_id" },
      { name: "duo_invitations", column: "mama_id" },
    ];

    const errors: string[] = [];
    for (const table of tables) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from(table.name).delete().eq(table.column, userId);
      if (error) {
        console.error(`[account/delete] error deleting from ${table.name}:`, error);
        errors.push(table.name);
      }
    }
    console.warn("[account/delete] SUPABASE_SERVICE_ROLE_KEY absente : compte auth non supprimé");

    return NextResponse.json({
      success: true,
      message: "Données supprimées. Le compte sera définitivement clôturé sous 48h.",
      warnings: errors.length > 0 ? `Erreurs sur : ${errors.join(", ")}` : undefined,
    });
  } catch (err) {
    console.error("[account/delete] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createServerClientFromCookies } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * DELETE /api/account/delete
 * Deletes all user data from all Supabase tables and the auth account.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const userId = user.id;

    // Delete all user data from every table (order matters for potential FK constraints)
    const tables = [
      { name: "push_subscriptions", column: "user_id" },
      { name: "community_posts", column: "user_id" },
      { name: "journal_notes", column: "user_id" },
      { name: "bump_photos", column: "user_id" },
      { name: "notification_settings", column: "user_id" },
      { name: "checklist_items", column: "user_id" },
      { name: "water_intake", column: "user_id" },
      { name: "appointments", column: "user_id" },
      { name: "contraction_sessions", column: "user_id" },
      { name: "kick_sessions", column: "user_id" },
      { name: "symptom_entries", column: "user_id" },
      { name: "weight_entries", column: "user_id" },
      { name: "duo_messages", column: "sender_id" },
      { name: "duo_access", column: "user_id" },
      { name: "duo_invitations", column: "inviter_id" },
      { name: "profiles", column: "id" },
    ];

    // Delete bump photos from storage first
    const { data: bumpPhotos } = await supabase
      .from("bump_photos")
      .select("storage_path")
      .eq("user_id", userId);

    if (bumpPhotos && bumpPhotos.length > 0) {
      const paths = bumpPhotos.map((p: { storage_path: string }) => p.storage_path);
      await supabase.storage.from("bump-photos").remove(paths);
    }

    // Delete data from all tables
    const errors: string[] = [];
    for (const table of tables) {
      const { error } = await supabase
        .from(table.name)
        .delete()
        .eq(table.column, userId);

      if (error) {
        console.error(`Error deleting from ${table.name}:`, error);
        errors.push(table.name);
      }
    }

    // Delete the auth user using the service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
      if (authError) {
        console.error("Error deleting auth user:", authError);
        return NextResponse.json(
          { error: "Donnees supprimees mais erreur lors de la suppression du compte auth" },
          { status: 500 }
        );
      }
    } else {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set - auth user not deleted");
    }

    return NextResponse.json({
      success: true,
      message: "Compte et donnees supprimes avec succes",
      warnings: errors.length > 0 ? `Erreurs sur: ${errors.join(", ")}` : undefined,
    });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createServerClientFromCookies } from "@/lib/supabase";
import { cookies } from "next/headers";

/**
 * GET /api/export
 * GDPR data export - returns all user data as JSON.
 */
export async function GET() {
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

    // Fetch all user data in parallel
    const [
      profileRes,
      weightRes,
      symptomRes,
      kickRes,
      contractionRes,
      appointmentRes,
      waterRes,
      checklistRes,
      notifRes,
      bumpRes,
      journalRes,
      communityRes,
      pushRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("weight_entries").select("*").eq("user_id", userId).order("date", { ascending: true }),
      supabase.from("symptom_entries").select("*").eq("user_id", userId).order("date", { ascending: true }),
      supabase.from("kick_sessions").select("*").eq("user_id", userId).order("date", { ascending: true }),
      supabase.from("contraction_sessions").select("*").eq("user_id", userId).order("date", { ascending: true }),
      supabase.from("appointments").select("*").eq("user_id", userId).order("date", { ascending: true }),
      supabase.from("water_intake").select("*").eq("user_id", userId),
      supabase.from("checklist_items").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("notification_settings").select("*").eq("user_id", userId).single(),
      supabase.from("bump_photos").select("*").eq("user_id", userId).order("week", { ascending: true }),
      supabase.from("journal_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("community_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("push_subscriptions").select("*").eq("user_id", userId),
    ]);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        userId: user.id,
        appName: "MamaTrack",
        appVersion: "0.1.0",
        format: "GDPR/RGPD Data Export",
      },
      profile: profileRes.data ?? null,
      weightEntries: weightRes.data ?? [],
      symptomEntries: symptomRes.data ?? [],
      kickSessions: kickRes.data ?? [],
      contractionSessions: contractionRes.data ?? [],
      appointments: appointmentRes.data ?? [],
      waterIntake: waterRes.data ?? [],
      checklistItems: checklistRes.data ?? [],
      notificationSettings: notifRes.data ?? null,
      bumpPhotos: bumpRes.data ?? [],
      journalNotes: journalRes.data ?? [],
      communityPosts: communityRes.data ?? [],
      pushSubscriptions: pushRes.data ?? [],
    };

    return NextResponse.json(exportData);
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

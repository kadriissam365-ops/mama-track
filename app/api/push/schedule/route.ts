import { NextRequest, NextResponse } from "next/server";
import { createServerClientFromCookies } from "@/lib/supabase";
import { cookies } from "next/headers";
import { DEFAULT_PREFERENCES } from "@/lib/notification-scheduler";

/**
 * GET /api/push/schedule
 * Returns the authenticated user's notification preferences.
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

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found — that is fine, return defaults
      console.error("Error fetching notification preferences:", error);
      return NextResponse.json(
        { error: "Erreur lors de la recuperation" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        preferences: { userId: user.id, ...DEFAULT_PREFERENCES },
      });
    }

    return NextResponse.json({
      preferences: {
        userId: data.user_id,
        dailyTips: data.daily_tips,
        dailyTipTime: data.daily_tip_time,
        appointmentReminders: data.appointment_reminders,
        appointmentReminderAdvance: data.appointment_reminder_advance,
        weeklyMilestones: data.weekly_milestones,
        hydrationReminders: data.hydration_reminders,
        hydrationIntervalMinutes: data.hydration_interval_minutes,
        kickCountReminders: data.kick_count_reminders,
        kickReminderTime: data.kick_reminder_time,
        partnerNotifications: data.partner_notifications,
      },
    });
  } catch (err) {
    console.error("GET /api/push/schedule error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/push/schedule
 * Creates or updates the authenticated user's notification preferences.
 *
 * Body: Partial<NotificationPreferences> (camelCase keys)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const body = await request.json();

    // Build the row to upsert — only include fields that were provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: Record<string, any> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (body.dailyTips !== undefined) row.daily_tips = body.dailyTips;
    if (body.dailyTipTime !== undefined) row.daily_tip_time = body.dailyTipTime;
    if (body.appointmentReminders !== undefined)
      row.appointment_reminders = body.appointmentReminders;
    if (body.appointmentReminderAdvance !== undefined)
      row.appointment_reminder_advance = body.appointmentReminderAdvance;
    if (body.weeklyMilestones !== undefined)
      row.weekly_milestones = body.weeklyMilestones;
    if (body.hydrationReminders !== undefined)
      row.hydration_reminders = body.hydrationReminders;
    if (body.hydrationIntervalMinutes !== undefined)
      row.hydration_interval_minutes = body.hydrationIntervalMinutes;
    if (body.kickCountReminders !== undefined)
      row.kick_count_reminders = body.kickCountReminders;
    if (body.kickReminderTime !== undefined)
      row.kick_reminder_time = body.kickReminderTime;
    if (body.partnerNotifications !== undefined)
      row.partner_notifications = body.partnerNotifications;

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(row, { onConflict: "user_id" });

    if (error) {
      console.error("Error saving notification preferences:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/push/schedule error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

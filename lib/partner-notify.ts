/**
 * Partner notification dispatch for MamaTrack duo mode.
 *
 * Resolves a mama's active partners via `duo_access`, filters those who
 * opted-in through `notification_preferences.partner_notifications`, then
 * sends a web-push notification to every active endpoint.
 *
 * Designed to run in API route handlers or cron jobs (Node runtime).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildPartnerNotificationPayload,
  getCurrentWeekFromDueDate,
} from "./notification-scheduler";

export type PartnerNotificationType = "weekly-update" | "appointment" | "milestone";

export interface PartnerNotificationDetails {
  week?: number;
  appointmentTitle?: string;
  milestone?: string;
}

export interface DispatchResult {
  partnerCount: number;
  sent: number;
  failed: number;
  skipped: number;
}

interface PushSubRow {
  endpoint: string;
  subscription_json: string;
}

type WebPush = typeof import("web-push");
let webpushPromise: Promise<WebPush | null> | null = null;

async function getConfiguredWebPush(): Promise<WebPush | null> {
  if (!webpushPromise) {
    webpushPromise = (async () => {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      const subject = process.env.VAPID_SUBJECT || "mailto:contact@mamatrack.fr";
      if (!publicKey || !privateKey) return null;
      const webpush = (await import("web-push")).default;
      webpush.setVapidDetails(subject, publicKey, privateKey);
      return webpush;
    })();
  }
  return webpushPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

/**
 * Dispatch a push notification to every active, opted-in partner of `mamaId`.
 *
 * The `supabase` client must have permission to read `duo_access`,
 * `notification_preferences`, and `push_subscriptions` for the target rows.
 * When called from an authenticated route handler with RLS, this is satisfied
 * because duo_access rows are readable by either participant; partner prefs
 * and subscriptions must be readable by the partner themselves, so for cron
 * paths a service-role client is required.
 */
export async function dispatchPartnerNotification(
  supabase: AnySupabase,
  mamaId: string,
  type: PartnerNotificationType,
  details: PartnerNotificationDetails,
): Promise<DispatchResult> {
  const result: DispatchResult = { partnerCount: 0, sent: 0, failed: 0, skipped: 0 };

  const webpush = await getConfiguredWebPush();
  if (!webpush) {
    result.skipped = 1;
    return result;
  }

  const { data: accessRows, error: accessError } = await supabase
    .from("duo_access")
    .select("partner_id")
    .eq("mama_id", mamaId);

  if (accessError || !accessRows || accessRows.length === 0) {
    return result;
  }

  const partnerIds = Array.from(
    new Set((accessRows as { partner_id: string }[]).map((r) => r.partner_id)),
  );
  result.partnerCount = partnerIds.length;

  const payload = JSON.stringify(buildPartnerNotificationPayload(type, details));

  for (const partnerId of partnerIds) {
    const { data: prefRow } = await supabase
      .from("notification_preferences")
      .select("partner_notifications")
      .eq("user_id", partnerId)
      .maybeSingle();

    // Opt-in is explicit: partner must have toggled `partner_notifications = true`.
    // If no row exists, default (from DEFAULT_PREFERENCES) is false → skip.
    const optedIn = (prefRow as { partner_notifications: boolean } | null)
      ?.partner_notifications === true;
    if (!optedIn) {
      result.skipped += 1;
      continue;
    }

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, subscription_json")
      .eq("user_id", partnerId);

    if (!subs || subs.length === 0) {
      result.skipped += 1;
      continue;
    }

    await Promise.all(
      (subs as PushSubRow[]).map(async (sub) => {
        try {
          await webpush.sendNotification(JSON.parse(sub.subscription_json), payload);
          result.sent += 1;
        } catch (err: unknown) {
          result.failed += 1;
          const e = err as { statusCode?: number };
          // Subscription gone — GC the row so we stop retrying.
          if (e.statusCode === 410 || e.statusCode === 404) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
        }
      }),
    );
  }

  return result;
}

/**
 * Compute the current pregnancy week for a given mama (via profiles.due_date),
 * then dispatch a "weekly-update" partner notification. Used by the weekly cron.
 */
export async function dispatchWeeklyPartnerUpdate(
  supabase: AnySupabase,
  mamaId: string,
): Promise<DispatchResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("due_date")
    .eq("id", mamaId)
    .maybeSingle();

  const dueDate = (profile as { due_date: string | null } | null)?.due_date;
  if (!dueDate) {
    return { partnerCount: 0, sent: 0, failed: 0, skipped: 1 };
  }

  const week = getCurrentWeekFromDueDate(dueDate);
  return dispatchPartnerNotification(supabase, mamaId, "weekly-update", { week });
}

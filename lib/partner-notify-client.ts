/**
 * Client-side helper that fires a partner notification from the mama's
 * session after a meaningful event (appointment, milestone, weekly update).
 *
 * Fire-and-forget — never throws, never blocks the caller. Failures are
 * logged to the console so the UI flow stays smooth even if the partner
 * has no active subscriptions or opted out.
 */

export type PartnerNotifyType = "weekly-update" | "appointment" | "milestone";

export interface PartnerNotifyDetails {
  week?: number;
  appointmentTitle?: string;
  milestone?: string;
}

export function notifyPartner(
  type: PartnerNotifyType,
  details: PartnerNotifyDetails = {},
): void {
  if (typeof window === "undefined") return;
  void fetch("/api/partner-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, details }),
    credentials: "include",
    keepalive: true,
  }).catch((err) => {
    console.warn("[partner-notify] dispatch failed:", err);
  });
}

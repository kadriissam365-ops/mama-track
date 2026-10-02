import webpush, { type PushSubscription as WPSubscription } from "web-push";
import { validPushEndpoint } from "@/lib/push-validation";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:contact@mamatrack.fr";
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID env vars");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  icon?: string;
  data?: Record<string, unknown>;
};

export type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPush(
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<{ ok: true } | { ok: false; gone: boolean; status?: number }> {
  ensureConfigured();
  if (!validPushEndpoint(sub.endpoint)) return { ok: false, gone: true };
  const wpSub: WPSubscription = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  };
  try {
    await webpush.sendNotification(wpSub, JSON.stringify(payload));
    return { ok: true };
  } catch (e) {
    const err = e as { statusCode?: number; body?: string };
    const status = err.statusCode;
    const gone = status === 404 || status === 410;
    return { ok: false, gone, status };
  }
}

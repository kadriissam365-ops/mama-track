import "server-only";

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

let webpushModule: typeof import("web-push") | null = null;
let vapidConfigured = false;

async function getWebPush(): Promise<typeof import("web-push") | null> {
  if (!webpushModule) {
    webpushModule = (await import("web-push")).default;
  }
  if (!vapidConfigured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:contact@mamatrack.fr";
    if (!publicKey || !privateKey) return null;
    webpushModule.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }
  return webpushModule;
}

export async function sendPushToUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  userId: string,
  payload: PushPayload,
): Promise<number> {
  const webpush = await getWebPush();
  if (!webpush) return 0;

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, subscription_json")
    .eq("user_id", userId);

  const list = (subs ?? []) as { endpoint: string; subscription_json: string }[];
  if (list.length === 0) return 0;

  const body = JSON.stringify(payload);
  let sent = 0;
  await Promise.all(
    list.map(async (sub) => {
      try {
        await webpush.sendNotification(JSON.parse(sub.subscription_json), body);
        sent += 1;
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        if (e.statusCode === 410 || e.statusCode === 404) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }),
  );
  return sent;
}

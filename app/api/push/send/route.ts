import { NextRequest, NextResponse } from "next/server";
import { createServerClientFromCookies } from "@/lib/supabase";
import { cookies } from "next/headers";

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

let webpushInstance: typeof import("web-push") | null = null;
let vapidConfigured = false;

async function getWebPush() {
  if (!webpushInstance) {
    webpushInstance = (await import("web-push")).default;
  }
  if (!vapidConfigured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:contact@mamatrack.app";
    if (publicKey && privateKey) {
      webpushInstance.setVapidDetails(subject, publicKey, privateKey);
      vapidConfigured = true;
    } else {
      return null;
    }
  }
  return webpushInstance;
}

export async function POST(request: NextRequest) {
  try {
    const webpush = await getWebPush();
    if (!webpush) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const targetUserId = body.userId || user.id;
    const payload: PushPayload = {
      title: body.title || "MamaTrack",
      body: body.body || "",
      tag: body.tag,
      url: body.url,
    };

    const result = await (supabase as any)
      .from("push_subscriptions")
      .select("subscription_json, endpoint")
      .eq("user_id", targetUserId);
    const subscriptions = result.data as { subscription_json: string; endpoint: string }[] | null;
    const error = result.error;

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des abonnements" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "Aucun abonnement push trouvé", sent: 0 },
        { status: 404 }
      );
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = JSON.parse(sub.subscription_json);
        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );
          return { endpoint: sub.endpoint, success: true };
        } catch (err: unknown) {
          const pushError = err as { statusCode?: number };
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            await (supabase as any)
              .from("push_subscriptions")
              .delete()
              .eq("user_id", targetUserId)
              .eq("endpoint", sub.endpoint);
          }
          throw err;
        }
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

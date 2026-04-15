import { NextRequest, NextResponse } from "next/server";
import { createServerClientFromCookies } from "@/lib/supabase";
import { cookies } from "next/headers";
import webpush from "web-push";

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@mamatrack.app";
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
    return true;
  }
  return false;
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

/**
 * POST /api/push/send
 * Sends a push notification to a specific user or the authenticated user.
 *
 * Body: {
 *   userId?: string;        // optional, defaults to authenticated user
 *   title: string;
 *   body: string;
 *   tag?: string;
 *   url?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    if (!ensureVapidConfigured()) {
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
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const body = await request.json();
    const targetUserId = body.userId || user.id;
    const payload: PushPayload = {
      title: body.title || "MamaTrack",
      body: body.body || "",
      tag: body.tag,
      url: body.url,
    };

    // Fetch all push subscriptions for the target user
    const result = await (supabase as any)
      .from("push_subscriptions")
      .select("subscription_json, endpoint")
      .eq("user_id", targetUserId);
    const subscriptions = result.data as { subscription_json: string; endpoint: string }[] | null;
    const error = result.error;

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json(
        { error: "Erreur lors de la recuperation des abonnements" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "Aucun abonnement push trouve", sent: 0 },
        { status: 404 }
      );
    }

    // Send push to all user subscriptions
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
          // If subscription is expired/invalid, clean it up
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

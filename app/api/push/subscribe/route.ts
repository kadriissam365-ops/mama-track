import { NextRequest, NextResponse } from "next/server";
import { createServerClientFromCookies } from "@/lib/supabase";
import { cookies } from "next/headers";

/**
 * POST /api/push/subscribe
 * Stores or updates a Web Push subscription for the authenticated user.
 *
 * Body: { subscription: PushSubscriptionJSON }
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
    const subscription = body.subscription;

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Subscription invalide" },
        { status: 400 }
      );
    }

    // Upsert the push subscription keyed on (user_id, endpoint)
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys?.p256dh ?? "",
        keys_auth: subscription.keys?.auth ?? "",
        subscription_json: JSON.stringify(subscription),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      console.error("Error saving push subscription:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe
 * Removes a push subscription for the authenticated user.
 *
 * Body: { endpoint: string }
 */
export async function DELETE(request: NextRequest) {
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
    const endpoint = body.endpoint;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint manquant" },
        { status: 400 }
      );
    }

    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

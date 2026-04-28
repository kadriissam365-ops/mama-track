import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getSupabaseAdmin } from "@/lib/stripe-server";

export const runtime = "nodejs";

type ProfileUpdate = {
  is_premium?: boolean;
  premium_until?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

async function updateProfileByCustomer(
  customerId: string,
  patch: ProfileUpdate,
) {
  const admin = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("profiles")
    .update(patch)
    .eq("stripe_customer_id", customerId);
  if (error) {
    console.error("[stripe webhook] update by customer failed:", error);
  }
}

async function updateProfileById(userId: string, patch: ProfileUpdate) {
  const admin = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) {
    console.error("[stripe webhook] update by id failed:", error);
  }
}

function periodEndIso(sub: Stripe.Subscription): string | null {
  const items = sub.items?.data ?? [];
  const ts = items[0]?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000).toISOString() : null;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (session.metadata?.supabase_user_id as string | undefined) ??
          (session.client_reference_id ?? undefined);
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        if (!userId || !customerId) break;

        let until: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          until = periodEndIso(sub);
        }

        await updateProfileById(userId, {
          is_premium: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          premium_until: until,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const active =
          sub.status === "active" ||
          sub.status === "trialing" ||
          sub.status === "past_due";
        await updateProfileByCustomer(customerId, {
          is_premium: active,
          stripe_subscription_id: sub.id,
          premium_until: periodEndIso(sub),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await updateProfileByCustomer(customerId, {
          is_premium: false,
          stripe_subscription_id: null,
          premium_until: periodEndIso(sub),
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

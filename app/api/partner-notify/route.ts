import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase-admin";
import {
  dispatchPartnerNotification,
  type PartnerNotificationType,
} from "@/lib/partner-notify";

export const runtime = "nodejs";

const VALID_TYPES: PartnerNotificationType[] = [
  "weekly-update",
  "appointment",
  "milestone",
];

/**
 * POST /api/partner-notify
 *
 * Triggered client-side after a meaningful event (appointment created,
 * week milestone reached, etc.). The authenticated user is treated as the
 * mama; the helper resolves their active partners and dispatches pushes.
 *
 * Body: { type: PartnerNotificationType, details?: { week?, appointmentTitle?, milestone? } }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const type = body?.type as PartnerNotificationType | undefined;
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "type invalide" },
        { status: 400 },
      );
    }

    const details = {
      week: typeof body?.details?.week === "number" ? body.details.week : undefined,
      appointmentTitle:
        typeof body?.details?.appointmentTitle === "string"
          ? body.details.appointmentTitle
          : undefined,
      milestone:
        typeof body?.details?.milestone === "string" ? body.details.milestone : undefined,
    };

    // L'identité de la maman est vérifiée via son JWT ; les lectures des partenaires
    // (préférences + abonnements push) nécessitent le client admin.
    const reader = isAdminConfigured() ? createAdminClient() : supabase;
    const result = await dispatchPartnerNotification(supabase, user.id, type, details, reader);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("POST /api/partner-notify error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

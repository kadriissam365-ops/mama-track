import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { createServerClientFromCookies } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = "papa" | "sagefemme" | "famille";

interface RequestBody {
  email?: string;
  role?: Role;
}

const ROLE_LABELS: Record<Role, string> = {
  papa: "Papa",
  sagefemme: "Sage-femme",
  famille: "Famille",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDueDate(due: string | null): string | null {
  if (!due) return null;
  try {
    const d = new Date(due);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

function buildInviteEmail(opts: {
  inviteUrl: string;
  role: Role;
  mamaName: string | null;
  babyName: string | null;
  dueDateLabel: string | null;
}): { subject: string; html: string; text: string } {
  const roleLabel = ROLE_LABELS[opts.role];
  const greeter = opts.mamaName ? escapeHtml(opts.mamaName) : "une future maman";
  const babyLabel = opts.babyName ? escapeHtml(opts.babyName) : "bébé";
  const dueLine = opts.dueDateLabel
    ? `<p style="font-size:14px;color:#6b7280;margin:8px 0 0 0;">Date prévue d'accouchement : <strong style="color:#3d2b2b;">${escapeHtml(opts.dueDateLabel)}</strong></p>`
    : "";

  const subject = `${greeter} vous invite à suivre sa grossesse sur MamaTrack`;

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#fdf2f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(244,114,182,0.12);">
        <tr><td style="background:linear-gradient(135deg,#fbcfe8 0%,#e9d5ff 100%);padding:32px 24px;text-align:center;">
          <div style="font-size:48px;line-height:1;">🤰💕</div>
          <h1 style="margin:12px 0 4px 0;font-size:24px;color:#3d2b2b;">Mode Duo MamaTrack</h1>
          <p style="margin:0;font-size:14px;color:#6b21a8;">Rôle : ${escapeHtml(roleLabel)}</p>
        </td></tr>
        <tr><td style="padding:28px 28px 8px 28px;">
          <p style="font-size:16px;color:#3d2b2b;margin:0 0 12px 0;">Bonjour 👋</p>
          <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 12px 0;">
            <strong>${greeter}</strong> vous invite à suivre la grossesse de <strong>${babyLabel}</strong> sur MamaTrack, en tant que <strong>${escapeHtml(roleLabel.toLowerCase())}</strong>.
          </p>
          ${dueLine}
          <p style="font-size:15px;color:#374151;line-height:1.6;margin:16px 0 0 0;">
            En acceptant, vous pourrez voir l'évolution de bébé semaine après semaine, recevoir les mises à jour importantes et envoyer des messages de soutien.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:24px 28px 8px 28px;">
          <a href="${opts.inviteUrl}" style="display:inline-block;background:linear-gradient(90deg,#f472b6,#a855f7);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:14px;box-shadow:0 4px 12px rgba(168,85,247,0.25);">
            Accepter l'invitation
          </a>
        </td></tr>
        <tr><td style="padding:8px 28px 24px 28px;text-align:center;">
          <p style="font-size:12px;color:#9ca3af;margin:8px 0 0 0;">Ou copiez ce lien :</p>
          <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:4px 0 0 0;"><a href="${opts.inviteUrl}" style="color:#a855f7;">${escapeHtml(opts.inviteUrl)}</a></p>
        </td></tr>
        <tr><td style="background:#fdf2f8;padding:16px 28px;text-align:center;">
          <p style="font-size:11px;color:#9ca3af;margin:0;">Vous recevez cet email parce que ${greeter} a renseigné votre adresse pour partager sa grossesse. Si vous ne connaissez pas cette personne, ignorez ce message.</p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:#9ca3af;margin:16px 0 0 0;">MamaTrack · Le suivi de grossesse bienveillant</p>
    </td></tr>
  </table>
</body></html>`;

  const text = `${greeter} vous invite à suivre sa grossesse sur MamaTrack en tant que ${roleLabel}.

Acceptez l'invitation : ${opts.inviteUrl}

MamaTrack — Le suivi de grossesse bienveillant`;

  return { subject, html, text };
}

async function sendInviteEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not configured" };
  const from = process.env.RESEND_FROM || "MamaTrack <noreply@mamatrack.fr>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Premium gate (mirrors app/api/vision/ordonnance/route.ts pattern).
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("is_premium, premium_until, mama_name, baby_name, due_date")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRaw as
    | {
        is_premium?: boolean;
        premium_until?: string | null;
        mama_name?: string | null;
        baby_name?: string | null;
        due_date?: string | null;
      }
    | null;
  const premium =
    Boolean(profile?.is_premium) &&
    (!profile?.premium_until || new Date(profile.premium_until) > new Date());
  if (!premium) {
    return NextResponse.json(
      { error: "Le Mode Duo est réservé aux membres Premium." },
      { status: 402 },
    );
  }

  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const role = body.role;
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (role !== "papa" && role !== "sagefemme" && role !== "famille") {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  // Reject duplicate pending invitations for the same (mama, email).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from as any)("duo_invitations")
    .select("id")
    .eq("mama_id", user.id)
    .eq("email", email)
    .is("accepted_at", null)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Une invitation est déjà en attente pour cet email." },
      { status: 409 },
    );
  }

  const token = randomBytes(32).toString("hex");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error: insertError } = await (supabase.from as any)("duo_invitations")
    .insert({
      mama_id: user.id,
      email,
      token,
      role,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    console.error("[duo/invite] insert error:", insertError);
    return NextResponse.json(
      { error: "Impossible de créer l'invitation." },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mamatrack.fr";
  const shareUrl = `${appUrl.replace(/\/$/, "")}/invite?token=${token}`;

  let emailSent = false;
  let emailError: string | undefined;
  if (process.env.RESEND_API_KEY) {
    const tmpl = buildInviteEmail({
      inviteUrl: shareUrl,
      role,
      mamaName: profile?.mama_name ?? null,
      babyName: profile?.baby_name ?? null,
      dueDateLabel: formatDueDate(profile?.due_date ?? null),
    });
    const sendRes = await sendInviteEmail({
      to: email,
      subject: tmpl.subject,
      html: tmpl.html,
      text: tmpl.text,
    });
    emailSent = sendRes.ok;
    if (!sendRes.ok) {
      emailError = sendRes.error;
      console.warn("[duo/invite] resend failed:", sendRes.error);
    }
  }

  return NextResponse.json({
    invitation: {
      id: inserted.id,
      mamaId: inserted.mama_id,
      email: inserted.email,
      token: inserted.token,
      role: inserted.role,
      acceptedAt: inserted.accepted_at,
      createdAt: inserted.created_at,
    },
    shareUrl,
    emailSent,
    error: emailError,
  });
}

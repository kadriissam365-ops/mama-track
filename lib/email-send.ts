export interface SendEmailResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendReportEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from = process.env.RESEND_FROM || "MamaTrack <bilan@mamatrack.fr>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}

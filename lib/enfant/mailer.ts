import nodemailer from "nodemailer";

let cachedTransporter: import("nodemailer").Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("Missing SMTP env vars (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

export type SendMailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: SendMailAttachment[];
};

export async function sendMail({
  to,
  subject,
  html,
  text,
  attachments,
}: SendMailInput) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? `MamaTrack <${process.env.SMTP_USER}>`;
  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text ?? stripHtml(html),
    attachments,
  });
}

function stripHtml(html: string) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

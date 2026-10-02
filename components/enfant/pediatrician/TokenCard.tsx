"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ClipboardCheck, Copy, Eye, Trash2 } from "lucide-react";
import { revokePediatricianToken } from "@/app/enfant/pediatrician/actions";

type Props = {
  id: string;
  url: string;
  label: string | null;
  expiresAt: string;
  scopeMonths: number;
  includeDiary: boolean;
  accessCount: number;
  lastAccessedAt: string | null;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatExpiry(expiresAt: string): { label: string; tone: "ok" | "warn" } {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { label: "expiré", tone: "warn" };
  const days = Math.ceil(ms / ONE_DAY_MS);
  if (days <= 1) {
    const hours = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)));
    return { label: `expire dans ${hours} h`, tone: "warn" };
  }
  return {
    label: `expire dans ${days} jour${days > 1 ? "s" : ""}`,
    tone: days <= 2 ? "warn" : "ok",
  };
}

export function TokenCard({
  id,
  url,
  label,
  expiresAt,
  scopeMonths,
  includeDiary,
  accessCount,
  lastAccessedAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const expiry = formatExpiry(expiresAt);
  const expiresLabel = new Date(expiresAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lastAccessLabel = lastAccessedAt
    ? new Date(lastAccessedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback : sélection manuelle
      const input = document.getElementById(
        `pedi-url-${id}`,
      ) as HTMLInputElement | null;
      input?.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        /* noop */
      }
    }
  }

  function handleRevokeSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        "Révoquer ce lien ? Le pédiatre ne pourra plus y accéder. Cette action est immédiate.",
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* QR */}
        <div className="flex flex-shrink-0 flex-col items-center gap-2">
          <div className="rounded-xl border border-border bg-white p-2.5">
            <QRCodeSVG
              value={url}
              size={148}
              level="M"
              marginSize={0}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-center text-[10px] uppercase tracking-wider text-foreground-subtle">
            Scanner avec un smartphone
          </p>
        </div>

        {/* Infos + actions */}
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
              {label ?? "Lien sans nom"}
            </h3>
            <div
              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                expiry.tone === "warn"
                  ? "bg-warning-soft text-warning-text"
                  : "bg-success-soft text-success-text"
              }`}
            >
              {expiry.label}
            </div>
            <div className="mt-1 text-[11px] text-foreground-subtle">
              Expire le {expiresLabel}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-foreground-muted">
              {scopeMonths} mois de données
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 ${
                includeDiary
                  ? "border-accent/40 bg-accent-soft text-accent-strong"
                  : "border-border bg-background text-foreground-muted"
              }`}
            >
              {includeDiary ? "Journal inclus" : "Sans journal"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-foreground-muted">
              <Eye className="h-3 w-3" />
              {accessCount} accès
            </span>
          </div>

          {lastAccessLabel && (
            <p className="text-[11px] text-foreground-subtle">
              Dernière consultation : {lastAccessLabel}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id={`pedi-url-${id}`}
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full flex-1 truncate rounded-xl border border-border bg-background px-3 py-2 text-[11px] text-foreground-muted sm:text-xs"
            />
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand bg-brand px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5" /> Copié
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copier le lien
                </>
              )}
            </button>
          </div>

          <form action={revokePediatricianToken} onSubmit={handleRevokeSubmit}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-foreground-muted transition hover:border-danger hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <Trash2 className="h-3 w-3" />
              Révoquer ce lien
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

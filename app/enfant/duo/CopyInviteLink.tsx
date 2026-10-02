"use client";

import { useState } from "react";

export function CopyInviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select input content
      const input = document.getElementById(
        "invite-url-input",
      ) as HTMLInputElement | null;
      input?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        id="invite-url-input"
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground sm:text-sm"
      />
      <button
        type="button"
        onClick={copy}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        {copied ? "✓ Copié" : "📋 Copier"}
      </button>
    </div>
  );
}

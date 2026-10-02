"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted transition hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      <Printer className="h-3.5 w-3.5" />
      Imprimer
    </button>
  );
}

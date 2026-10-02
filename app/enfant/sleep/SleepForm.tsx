"use client";

import { useState } from "react";
import { Button, FormField, Input } from "@/components/enfant/ui";

export function SleepForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [kind, setKind] = useState<"nap" | "night">("nap");
  const nowIso = localIsoNow();
  const oneHourAgo = localIsoNow(-60);

  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <fieldset className="mb-4">
        <legend className="sr-only">Type de sommeil</legend>
        <div className="flex gap-2">
          {(
            [
              { k: "nap", label: "☀️ Sieste" },
              { k: "night", label: "🌙 Nuit" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.k}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                kind === opt.k
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-border text-foreground-muted hover:border-border-strong"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={opt.k}
                checked={kind === opt.k}
                onChange={() => setKind(opt.k)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Début" htmlFor="started_at">
          <Input
            id="started_at"
            type="datetime-local"
            name="started_at"
            defaultValue={oneHourAgo}
            required
          />
        </FormField>
        <FormField label="Fin" htmlFor="ended_at" hint="Laisser vide si en cours">
          <Input
            id="ended_at"
            type="datetime-local"
            name="ended_at"
            defaultValue={nowIso}
          />
        </FormField>
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1.5 block text-sm font-medium text-foreground">
          Qualité
        </legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((q) => (
            <label
              key={q}
              aria-label={`${q} étoile${q > 1 ? "s" : ""}`}
              className="flex-1 cursor-pointer rounded-xl border border-border bg-surface py-3 text-center text-sm text-foreground-muted transition hover:border-border-strong has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-strong"
            >
              <input
                type="radio"
                name="quality"
                value={q}
                className="sr-only"
                defaultChecked={q === 3}
              />
              <span aria-hidden>{"⭐".repeat(q)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label="Notes" htmlFor="notes" className="mt-3">
        <Input
          id="notes"
          type="text"
          name="notes"
          placeholder="Ex : s'est réveillé agité…"
        />
      </FormField>

      <Button type="submit" fullWidth className="mt-4">
        + Enregistrer
      </Button>
    </form>
  );
}

function localIsoNow(offsetMinutes = 0): string {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

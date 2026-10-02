"use client";

import { useState } from "react";

type FeedKind = "bottle" | "breast" | "solid" | "water";

export function FeedForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [kind, setKind] = useState<FeedKind>("bottle");
  const nowIso = localIsoNow();

  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <fieldset className="mb-4">
        <legend className="sr-only">Type de repas</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { k: "bottle", label: "🍼 Biberon" },
              { k: "breast", label: "🤱 Tétée" },
              { k: "solid", label: "🥣 Solide" },
              { k: "water", label: "💧 Eau" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.k}
              className={`flex cursor-pointer items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition sm:text-sm ${
                kind === opt.k
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-border-strong text-foreground-muted hover:border-brand/60"
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
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground-muted">
            Quand
          </label>
          <input
            type="datetime-local"
            name="started_at"
            defaultValue={nowIso}
            className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-foreground transition focus:border-brand focus:outline-none"
          />
        </div>

        {kind === "bottle" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">
              Quantité (ml)
            </label>
            <input
              type="number"
              name="amount_ml"
              min={5}
              max={500}
              placeholder="120"
              className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-foreground transition focus:border-brand focus:outline-none"
            />
          </div>
        )}

        {kind === "breast" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">
              Sein
            </label>
            <select
              name="side"
              className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-foreground transition focus:border-brand focus:outline-none"
            >
              <option value="left">Gauche</option>
              <option value="right">Droit</option>
              <option value="both">Les deux</option>
            </select>
          </div>
        )}

        {kind === "solid" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">
              Aliment
            </label>
            <input
              type="text"
              name="food"
              placeholder="Ex : purée carotte"
              className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-foreground transition focus:border-brand focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-foreground-muted">
          Notes (optionnel)
        </label>
        <input
          type="text"
          name="notes"
          placeholder="Ex : régurgitation, allergie possible…"
          className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-foreground transition focus:border-brand focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-strong"
      >
        + Enregistrer
      </button>
    </form>
  );
}

function localIsoNow(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

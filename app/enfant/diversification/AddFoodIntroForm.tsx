"use client";

import { useMemo, useState } from "react";
import { FOODS, type Food } from "@/lib/enfant/diversification-data";

export function AddFoodIntroForm({
  action,
  triedCodes,
}: {
  action: (formData: FormData) => void;
  triedCodes: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [foodCode, setFoodCode] = useState<string>("");
  const tried = useMemo(() => new Set(triedCodes), [triedCodes]);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => !tried.has(f.code))
      .filter((f) => (q ? f.label.toLowerCase().includes(q) : true))
      .slice(0, 30);
  }, [query, tried]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-border-strong bg-surface px-5 py-4 text-sm font-semibold text-foreground-muted transition hover:border-brand hover:text-brand"
      >
        + Noter une introduction
      </button>
    );
  }

  const selected: Food | undefined = FOODS.find((f) => f.code === foodCode);

  return (
    <form
      action={(fd) => {
        action(fd);
        setOpen(false);
        setFoodCode("");
        setQuery("");
      }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm bt-fade-up"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Nouvelle introduction
        </h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setFoodCode("");
          }}
          className="text-xs text-foreground-muted hover:text-foreground"
        >
          Annuler
        </button>
      </div>

      <div className="mb-3">
        <label
          htmlFor="food-search"
          className="mb-1 block text-xs font-medium text-foreground-muted"
        >
          Aliment
        </label>
        <input
          id="food-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (carotte, banane…)"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {available.length === 0 && (
            <p className="text-xs text-foreground-muted">
              Aucun aliment correspondant.
            </p>
          )}
          {available.map((f) => {
            const active = f.code === foodCode;
            return (
              <button
                key={f.code}
                type="button"
                onClick={() => setFoodCode(f.code)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground"
                }`}
              >
                <span aria-hidden>{f.emoji}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <input type="hidden" name="food_code" value={foodCode} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="intro-date"
            className="mb-1 block text-xs font-medium text-foreground-muted"
          >
            Date du premier essai
          </label>
          <input
            id="intro-date"
            type="date"
            name="first_tried_at"
            defaultValue={isoDate(new Date())}
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="intro-status"
            className="mb-1 block text-xs font-medium text-foreground-muted"
          >
            Réaction
          </label>
          <select
            id="intro-status"
            name="status"
            defaultValue="ok"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            <option value="ok">Bien toléré</option>
            <option value="reaction">Réaction allergique</option>
            <option value="avoid">À éviter</option>
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label
          htmlFor="intro-reaction"
          className="mb-1 block text-xs font-medium text-foreground-muted"
        >
          Détail réaction (optionnel)
        </label>
        <input
          id="intro-reaction"
          type="text"
          name="reaction"
          maxLength={200}
          placeholder="Ex : rougeurs autour de la bouche"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </div>

      <div className="mt-3">
        <label
          htmlFor="intro-notes"
          className="mb-1 block text-xs font-medium text-foreground-muted"
        >
          Notes (optionnel)
        </label>
        <textarea
          id="intro-notes"
          name="notes"
          rows={2}
          maxLength={500}
          placeholder="Quantité, préparation…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </div>

      {selected?.prepHint && (
        <p className="mt-3 rounded-xl bg-brand-soft/50 p-3 text-xs text-foreground-muted">
          💡 <strong>{selected.label}</strong> : {selected.prepHint}
        </p>
      )}

      <button
        type="submit"
        disabled={!foodCode}
        className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        Enregistrer
      </button>
    </form>
  );
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

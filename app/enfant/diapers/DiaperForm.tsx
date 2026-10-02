"use client";

import { useState } from "react";
import { Button, FormField, Input, Select } from "@/components/enfant/ui";

type DiaperKind = "wet" | "dirty" | "mixed" | "dry";

export function DiaperForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [kind, setKind] = useState<DiaperKind>("wet");
  const nowIso = localIsoNow();

  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <fieldset className="mb-4">
        <legend className="sr-only">Type de change</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { k: "wet", label: "💧 Pipi" },
              { k: "dirty", label: "💩 Caca" },
              { k: "mixed", label: "🔀 Mixte" },
              { k: "dry", label: "🌬️ Sèche" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.k}
              className={`flex cursor-pointer items-center justify-center rounded-xl border px-2 py-3 text-sm font-medium transition ${
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
        <FormField label="Quand" htmlFor="changed_at">
          <Input
            id="changed_at"
            type="datetime-local"
            name="changed_at"
            defaultValue={nowIso}
          />
        </FormField>

        {(kind === "dirty" || kind === "mixed") && (
          <FormField label="Consistance" htmlFor="consistency">
            <Select id="consistency" name="consistency" defaultValue="">
              <option value="">—</option>
              <option value="soft">Mou (normal)</option>
              <option value="liquid">Liquide</option>
              <option value="hard">Dur</option>
              <option value="seedy">Grainueux</option>
            </Select>
          </FormField>
        )}

        {(kind === "dirty" || kind === "mixed") && (
          <FormField label="Couleur" htmlFor="color">
            <Select id="color" name="color" defaultValue="">
              <option value="">—</option>
              <option value="yellow">Jaune (allaitement)</option>
              <option value="brown">Marron</option>
              <option value="green">Vert</option>
              <option value="black">Noir ⚠️</option>
              <option value="red">Rouge ⚠️</option>
              <option value="white">Blanc ⚠️</option>
            </Select>
          </FormField>
        )}
      </div>

      <FormField label="Notes" htmlFor="notes" className="mt-3">
        <Input
          id="notes"
          type="text"
          name="notes"
          placeholder="Ex : rougeurs, érythème, change difficile…"
        />
      </FormField>

      <Button type="submit" fullWidth className="mt-4">
        + Enregistrer le change
      </Button>
    </form>
  );
}

function localIsoNow(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

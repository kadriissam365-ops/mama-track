"use client";

import { useState } from "react";
import { Button, FormField, Input, Textarea } from "@/components/enfant/ui";

type HealthKind = "fever" | "medicine" | "appointment" | "symptom" | "other";

export function HealthForm({
  action,
  tempUnitLabel = "°C",
}: {
  action: (formData: FormData) => void;
  tempUnitLabel?: string;
}) {
  const [kind, setKind] = useState<HealthKind>("fever");
  const nowIso = localIsoNow();
  const isFahrenheit = tempUnitLabel === "°F";

  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <fieldset className="mb-4">
        <legend className="sr-only">Type d&apos;événement santé</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(
            [
              { k: "fever", label: "🌡️ Fièvre" },
              { k: "medicine", label: "💊 Médoc" },
              { k: "appointment", label: "👩‍⚕️ RDV" },
              { k: "symptom", label: "🤒 Symptôme" },
              { k: "other", label: "📝 Autre" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.k}
              className={`flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
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
        <FormField label="Quand" htmlFor="occurred_at">
          <Input
            id="occurred_at"
            type="datetime-local"
            name="occurred_at"
            defaultValue={nowIso}
          />
        </FormField>

        {kind === "fever" && (
          <FormField
            label={`Température (${tempUnitLabel})`}
            htmlFor="health-temperature"
          >
            <Input
              id="health-temperature"
              type="number"
              step="0.1"
              name="temperature_c"
              min={isFahrenheit ? 94 : 34}
              max={isFahrenheit ? 110 : 43}
              placeholder={isFahrenheit ? "101.3" : "38.5"}
              inputMode="decimal"
            />
          </FormField>
        )}

        {kind === "medicine" && (
          <>
            <FormField label="Médicament" htmlFor="medicine_name">
              <Input
                id="medicine_name"
                type="text"
                name="medicine_name"
                placeholder="Ex : Doliprane"
              />
            </FormField>
            <FormField label="Dose" htmlFor="dose">
              <Input id="dose" type="text" name="dose" placeholder="Ex : 2,5 ml" />
            </FormField>
          </>
        )}

        {kind === "appointment" && (
          <FormField label="Titre RDV" htmlFor="appt-title">
            <Input
              id="appt-title"
              type="text"
              name="title"
              placeholder="Ex : visite 4 mois pédiatre"
            />
          </FormField>
        )}
      </div>

      <FormField label="Description / notes" htmlFor="description" className="mt-3">
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Ex : toux nocturne, nez qui coule…"
        />
      </FormField>

      <Button type="submit" fullWidth className="mt-4">
        + Enregistrer
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

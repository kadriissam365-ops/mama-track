"use client";

import type { UnitSystem } from "@/lib/enfant/units";
import { Button, FormField, Input } from "@/components/enfant/ui";

export function GrowthForm({
  action,
  units,
}: {
  action: (formData: FormData) => void;
  units: UnitSystem;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const weightLabel = units === "imperial" ? "Poids (lb)" : "Poids (kg)";
  const lengthLabel = units === "imperial" ? "Taille (in)" : "Taille (cm)";
  const headLabel = units === "imperial" ? "PC (in)" : "PC (cm)";
  const weightPlaceholder = units === "imperial" ? "12.3" : "5.6";
  const lengthPlaceholder = units === "imperial" ? "23.0" : "58.4";
  const headPlaceholder = units === "imperial" ? "15.4" : "39.1";

  return (
    <form
      action={action}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <input type="hidden" name="_input_units" value={units} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Date" htmlFor="measured_at">
          <Input
            id="measured_at"
            type="date"
            name="measured_at"
            defaultValue={today}
          />
        </FormField>
        <FormField label={weightLabel} htmlFor="weight">
          <Input
            id="weight"
            type="number"
            step="0.01"
            name="weight"
            placeholder={weightPlaceholder}
            inputMode="decimal"
          />
        </FormField>
        <FormField label={lengthLabel} htmlFor="height">
          <Input
            id="height"
            type="number"
            step="0.1"
            name="height"
            placeholder={lengthPlaceholder}
            inputMode="decimal"
          />
        </FormField>
        <FormField label={headLabel} htmlFor="head">
          <Input
            id="head"
            type="number"
            step="0.1"
            name="head"
            placeholder={headPlaceholder}
            inputMode="decimal"
          />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" className="mt-3">
        <Input
          id="notes"
          type="text"
          name="notes"
          placeholder="Ex : visite 2 mois pédiatre"
        />
      </FormField>

      <Button type="submit" fullWidth className="mt-4">
        + Enregistrer la mesure
      </Button>
    </form>
  );
}

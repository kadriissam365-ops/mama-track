"use client";

import { useState } from "react";

export function AddAppointmentForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const nowIso = localIsoNow();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-border-strong bg-surface px-5 py-4 text-sm font-semibold text-foreground-muted transition hover:border-brand hover:text-brand"
      >
        + Ajouter un RDV
      </button>
    );
  }

  return (
    <form
      action={(fd) => {
        action(fd);
        setOpen(false);
      }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm bt-fade-up"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Nouveau RDV</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-foreground-muted hover:text-foreground"
        >
          Annuler
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="appt-date"
            className="mb-1 block text-xs font-medium text-foreground-muted"
          >
            Date et heure
          </label>
          <input
            id="appt-date"
            type="datetime-local"
            name="occurred_at"
            defaultValue={nowIso}
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="appt-title"
            className="mb-1 block text-xs font-medium text-foreground-muted"
          >
            Titre
          </label>
          <input
            id="appt-title"
            type="text"
            name="title"
            placeholder="Ex : Pédiatre Dr Martin"
            maxLength={120}
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-3">
        <label
          htmlFor="appt-desc"
          className="mb-1 block text-xs font-medium text-foreground-muted"
        >
          Notes (optionnel)
        </label>
        <textarea
          id="appt-desc"
          name="description"
          rows={2}
          maxLength={500}
          placeholder="Adresse, raison du RDV…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-strong"
      >
        Enregistrer
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

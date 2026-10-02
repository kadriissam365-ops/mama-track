"use client";

import { useState } from "react";
import { Button, FormField, Input, Select, Textarea } from "@/components/enfant/ui";

const MOODS = [
  { val: "happy", label: "😊 Ravi" },
  { val: "calm", label: "🥰 Calme" },
  { val: "fussy", label: "😤 Grognon" },
  { val: "sick", label: "🤒 Malade" },
  { val: "excited", label: "🤩 Émerveillé" },
] as const;

export function DiaryForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [mood, setMood] = useState<string>("happy");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Date" htmlFor="entry_date" required>
          <Input
            id="entry_date"
            type="date"
            name="entry_date"
            defaultValue={today}
            required
          />
        </FormField>
        <FormField label="Humeur" htmlFor="mood">
          <Select
            id="mood"
            name="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            {MOODS.map((m) => (
              <option key={m.val} value={m.val}>
                {m.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Titre" htmlFor="title" className="mt-3" hint="Optionnel">
        <Input
          id="title"
          type="text"
          name="title"
          placeholder="Ex : premier éclat de rire !"
        />
      </FormField>

      <FormField label="Ton mot du jour" htmlFor="body" className="mt-3">
        <Textarea
          id="body"
          name="body"
          rows={4}
          placeholder="Qu'est-ce qu'il a fait de spécial aujourd'hui ?"
        />
      </FormField>

      <FormField label="Photo" htmlFor="photo" className="mt-3" hint="Max 8 Mo. JPG, PNG, WEBP, HEIC.">
        <input
          id="photo"
          type="file"
          name="photo"
          accept="image/*"
          className="block w-full text-sm text-foreground-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-strong hover:file:bg-brand-soft/80"
        />
      </FormField>

      <Button type="submit" fullWidth className="mt-4">
        + Ajouter au journal
      </Button>
    </form>
  );
}

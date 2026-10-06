"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useFamily } from "@/lib/family";

export default function BabyPicker() {
  const family = useFamily();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  if (family.loading)
    return (
      <div
        aria-label="Chargement de votre famille"
        className="mb-4 h-12 animate-pulse rounded-xl bg-surface-muted"
      />
    );
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        {family.babies.length > 1 ? (
          <label className="flex-1 text-xs font-medium text-foreground-muted">
            Mon enfant
            <select
              aria-label="Choisir mon enfant"
              value={family.activeBabyId ?? ""}
              disabled={pending}
              className="mt-1 block w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm"
              onChange={async (event) => {
                setPending(true);
                setError("");
                try {
                  await family.select("baby", event.target.value);
                  router.refresh();
                } catch {
                  setError("Impossible de changer d’enfant pour le moment.");
                } finally {
                  setPending(false);
                }
              }}
            >
              {family.babies.map((baby) => (
                <option key={baby.id} value={baby.id}>
                  {baby.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Votre famille
          </p>
        )}
        <Link
          href="/enfant/naissance"
          className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border bg-surface px-3 text-xs text-foreground-muted"
        >
          <Plus size={14} />
          Un enfant
        </Link>
      </div>
      {error && (
        <p role="alert" className="mb-3 text-xs text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}

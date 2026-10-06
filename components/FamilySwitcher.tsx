"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Baby, Heart, Loader2, Sprout } from "lucide-react";
import { useFamily } from "@/lib/family";
import { childPhase, type JourneyPhase } from "@/lib/family-journey";

export default function FamilySwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const family = useFamily();
  const [pending, setPending] = useState<JourneyPhase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selected = family.babies.find(
    (baby) => baby.id === family.activeBabyId,
  );
  const phase = pathname.startsWith("/enfant")
    ? selected
      ? childPhase(selected.birth_date)
      : "baby"
    : "pregnancy";
  const switchTo = async (next: JourneyPhase) => {
    setPending(next);
    setError(null);
    try {
      if (next === "pregnancy") {
        await family.select("pregnancy");
        router.push("/?espace=grossesse");
      } else {
        const target =
          family.babies.find(
            (baby) =>
              baby.id === family.activeBabyId &&
              childPhase(baby.birth_date) === next,
          ) ??
          family.babies.find((baby) => childPhase(baby.birth_date) === next);
        if (target) {
          await family.select("baby", target.id);
          router.push("/enfant/dashboard");
        } else
          router.push(
            `/enfant/naissance${next === "child" ? "?parcours=enfant" : ""}`,
          );
      }
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Réessaie dans un instant.",
      );
    } finally {
      setPending(null);
    }
  };
  return (
    <div>
      <div
        className="mt-stage-switch"
        aria-label="Choisir un chapitre familial"
        aria-busy={family.loading}
      >
        {[
          { stage: "pregnancy" as const, label: "Grossesse", Icon: Heart },
          { stage: "baby" as const, label: "0–3 ans", Icon: Baby },
          { stage: "child" as const, label: "3–6 ans", Icon: Sprout },
        ].map(({ stage, label, Icon }) => (
          <button
            key={stage}
            type="button"
            onClick={() => switchTo(stage)}
            disabled={pending !== null || family.loading}
            aria-pressed={!family.loading && phase === stage}
          >
            {pending === stage ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Icon size={14} />
            )}
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

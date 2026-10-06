import { Check, Heart, Baby, Sprout } from "lucide-react";
import type { JourneyPhase } from "@/lib/family-journey";

export default function JourneyRail({
  phase,
  compact = false,
}: {
  phase: JourneyPhase;
  compact?: boolean;
}) {
  const steps = [
    { phase: "pregnancy", label: "Grossesse", Icon: Heart },
    { phase: "baby", label: "0–3 ans", Icon: Baby },
    { phase: "child", label: "3–6 ans", Icon: Sprout },
  ];
  const active = steps.findIndex((step) => step.phase === phase);
  return (
    <div
      className={`mt-journey-rail ${compact ? "mt-journey-compact" : ""}`}
      aria-label={`Votre parcours : ${steps[active].label}`}
    >
      {steps.map(({ phase: key, label, Icon }, index) => (
        <div
          key={key}
          className={`mt-journey-step ${index === active ? "is-current" : index < active ? "is-past" : ""}`}
          aria-current={index === active ? "step" : undefined}
        >
          <span>
            {index < active ? <Check size={14} /> : <Icon size={14} />}
          </span>
          <p>{label}</p>
        </div>
      ))}
    </div>
  );
}

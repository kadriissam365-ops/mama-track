import { cn } from "@/lib/enfant/cn";

type Tone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";
type Size = "sm" | "md";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-foreground-muted border-border",
  brand: "bg-brand-soft text-brand-strong border-brand/20",
  success: "bg-success-soft text-success-text border-success/20",
  warning: "bg-warning-soft text-warning-text border-warning/20",
  danger: "bg-danger-soft text-danger-text border-danger/20",
  info: "bg-info-soft text-info-text border-info/20",
  accent: "bg-accent-soft text-accent-strong border-accent/20",
};

const SIZES: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

type BadgeProps = {
  tone?: Tone;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Badge({
  tone = "neutral",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium uppercase tracking-wide",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

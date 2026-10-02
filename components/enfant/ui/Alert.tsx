import { cn } from "@/lib/enfant/cn";

type Tone = "info" | "success" | "warning" | "danger" | "brand";

const TONES: Record<Tone, { wrap: string; icon: string }> = {
  info: {
    wrap: "border-info/30 bg-info-soft text-info-text",
    icon: "ℹ️",
  },
  success: {
    wrap: "border-success/30 bg-success-soft text-success-text",
    icon: "✅",
  },
  warning: {
    wrap: "border-warning/30 bg-warning-soft text-warning-text",
    icon: "⚠️",
  },
  danger: {
    wrap: "border-danger/30 bg-danger-soft text-danger-text",
    icon: "⛔",
  },
  brand: {
    wrap: "border-brand/30 bg-brand-soft text-brand-strong",
    icon: "💡",
  },
};

type AlertProps = {
  tone?: Tone;
  title?: string;
  icon?: string | false;
  children?: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
  action?: React.ReactNode;
};

export function Alert({
  tone = "info",
  title,
  icon,
  children,
  className,
  role,
  action,
}: AlertProps) {
  const t = TONES[tone];
  const showIcon = icon !== false;
  const renderedIcon = icon ?? t.icon;
  return (
    <div
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-sm",
        t.wrap,
        className,
      )}
    >
      {showIcon && (
        <span aria-hidden className="mt-0.5 text-lg leading-none">
          {renderedIcon}
        </span>
      )}
      <div className="flex-1 space-y-1">
        {title && (
          <p className="font-semibold leading-tight">{title}</p>
        )}
        {children && (
          <div className="leading-relaxed [&_a]:underline [&_a]:font-medium">
            {children}
          </div>
        )}
      </div>
      {action && <div className="ml-2 shrink-0">{action}</div>}
    </div>
  );
}

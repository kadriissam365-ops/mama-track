import { cn } from "@/lib/enfant/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof React.JSX.IntrinsicElements;
  padded?: boolean;
  interactive?: boolean;
};

export function Card({
  className,
  children,
  as: Tag = "div",
  padded = true,
  interactive,
  ...rest
}: CardProps) {
  return (
    // @ts-expect-error generic dynamic tag
    <Tag
      className={cn(
        "rounded-3xl border border-border bg-surface shadow-[var(--shadow-card)]",
        padded && "p-5 sm:p-6",
        interactive && "bt-card-hover hover:border-border-strong",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};
export function SectionCard({
  title,
  description,
  action,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6",
        className,
      )}
      {...rest}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-lg font-medium tracking-[-0.015em] text-foreground sm:text-xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-foreground-muted">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type StatProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  className?: string;
};
export function StatCard({ label, value, hint, icon, className }: StatProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition hover:border-border-strong hover:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-foreground-subtle">
          {label}
        </span>
        {icon && (
          <span aria-hidden className="text-base">
            {icon}
          </span>
        )}
      </div>
      <div className="font-display mt-2 text-2xl font-medium tracking-[-0.02em] text-foreground sm:text-3xl">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-foreground-subtle">{hint}</div>
      )}
    </div>
  );
}

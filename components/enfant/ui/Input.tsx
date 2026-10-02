import { cn } from "@/lib/enfant/cn";

const FIELD_BASE =
  "w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-[var(--shadow-xs)] transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-surface-muted";

const FIELD_HEIGHT = "h-12"; // 48px touch target

type LabelBlockProps = {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: LabelBlockProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-foreground-subtle">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};
export function Input({ className, invalid, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        FIELD_BASE,
        FIELD_HEIGHT,
        invalid && "border-danger focus:border-danger focus:ring-danger/15",
        className,
      )}
      {...rest}
    />
  );
}

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};
export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          FIELD_BASE,
          FIELD_HEIGHT,
          "appearance-none pr-10",
          invalid && "border-danger focus:border-danger focus:ring-danger/15",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted"
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5 8l5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};
export function Textarea({ className, invalid, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        FIELD_BASE,
        "min-h-[88px] py-3 leading-relaxed resize-y",
        invalid && "border-danger focus:border-danger focus:ring-danger/15",
        className,
      )}
      {...rest}
    />
  );
}

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
  hint?: string;
};
export function Checkbox({ label, hint, className, id, ...rest }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-border-strong",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 cursor-pointer accent-brand"
        {...rest}
      />
      <span className="flex-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-xs text-foreground-muted">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

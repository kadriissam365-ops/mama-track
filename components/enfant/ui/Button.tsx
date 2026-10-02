import Link from "next/link";
import { cn } from "@/lib/enfant/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "gradient" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[var(--shadow-soft)] hover:bg-brand-strong hover:shadow-[var(--shadow-card)] active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-brand",
  secondary:
    "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-surface-muted active:scale-[0.98] disabled:opacity-50",
  outline:
    "bg-transparent text-foreground border border-border-strong hover:border-brand hover:bg-brand-soft active:scale-[0.98] disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground-muted hover:text-foreground hover:bg-surface-muted active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-danger text-white shadow-[var(--shadow-soft)] hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
  success:
    "bg-success text-white shadow-[var(--shadow-soft)] hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
  gradient:
    "bt-bg-gradient text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-float)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 bt-shine",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-13 px-7 text-base rounded-full",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.005em] transition-[transform,box-shadow,background,color,border-color] duration-200 ease-[var(--ease-out-expo)] select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 cursor-pointer disabled:cursor-not-allowed";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

export type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export type ButtonLinkProps = CommonProps &
  Omit<React.ComponentProps<typeof Link>, "children" | "className">;

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
export default function ActionButton({
  children,
  className = "mt-button",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-label={label}
      aria-busy={pending}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

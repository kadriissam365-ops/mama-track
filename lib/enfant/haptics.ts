/**
 * Wrapper Vibration API + iOS WebKit haptics.
 * No-op si non supporté (silently fails). À utiliser sur les actions clés :
 * - tap CTA primaire → light
 * - confirm action → medium
 * - delete / danger → heavy
 * - succès → success pattern
 */

type Pattern = "light" | "medium" | "heavy" | "success" | "error" | "warning";

const PATTERNS: Record<Pattern, number | number[]> = {
  light: 10,
  medium: 18,
  heavy: 30,
  success: [12, 60, 22],
  error: [40, 80, 40],
  warning: [20, 80, 20],
};

export function haptic(pattern: Pattern = "light"): void {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined") return;

  // Respect reduced-motion : pas de vibration non plus
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const value = PATTERNS[pattern];
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(value);
    }
  } catch {
    // ignore
  }
}

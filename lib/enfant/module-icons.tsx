import {
  AlertTriangle,
  Baby,
  Calendar,
  Camera,
  Clock,
  Droplet,
  FileText,
  HeartPulse,
  Lightbulb,
  Moon,
  QrCode,
  Salad,
  Settings,
  Sparkles,
  Syringe,
  Trophy,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export type ModuleTone =
  | "pink"
  | "rose"
  | "fuchsia"
  | "purple"
  | "violet"
  | "indigo"
  | "sky"
  | "teal"
  | "emerald"
  | "lime"
  | "amber"
  | "orange"
  | "red"
  | "slate";

export const TONE_BG: Record<ModuleTone, string> = {
  pink: "bg-pink-100 dark:bg-pink-900/30",
  rose: "bg-rose-100 dark:bg-rose-900/30",
  fuchsia: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
  purple: "bg-purple-100 dark:bg-purple-900/30",
  violet: "bg-violet-100 dark:bg-violet-900/30",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30",
  sky: "bg-sky-100 dark:bg-sky-900/30",
  teal: "bg-teal-100 dark:bg-teal-900/30",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30",
  lime: "bg-lime-100 dark:bg-lime-900/30",
  amber: "bg-amber-100 dark:bg-amber-900/30",
  orange: "bg-orange-100 dark:bg-orange-900/30",
  red: "bg-red-100 dark:bg-red-900/30",
  slate: "bg-slate-100 dark:bg-slate-800/40",
};

export const TONE_FG: Record<ModuleTone, string> = {
  pink: "text-pink-600 dark:text-pink-300",
  rose: "text-rose-600 dark:text-rose-300",
  fuchsia: "text-fuchsia-600 dark:text-fuchsia-300",
  purple: "text-purple-600 dark:text-purple-300",
  violet: "text-violet-600 dark:text-violet-300",
  indigo: "text-indigo-600 dark:text-indigo-300",
  sky: "text-sky-600 dark:text-sky-300",
  teal: "text-teal-600 dark:text-teal-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  lime: "text-lime-700 dark:text-lime-300",
  amber: "text-amber-600 dark:text-amber-300",
  orange: "text-orange-600 dark:text-orange-300",
  red: "text-red-600 dark:text-red-300",
  slate: "text-slate-600 dark:text-slate-300",
};

export type ModuleIconDef = { Icon: LucideIcon; tone: ModuleTone };

export const MODULE_ICONS: Record<string, ModuleIconDef> = {
  feed: { Icon: Utensils, tone: "pink" },
  diversification: { Icon: Salad, tone: "emerald" },
  sleep: { Icon: Moon, tone: "violet" },
  diapers: { Icon: Droplet, tone: "amber" },
  growth: { Icon: TrendingUp, tone: "teal" },
  vaccines: { Icon: Syringe, tone: "sky" },
  health: { Icon: HeartPulse, tone: "rose" },
  diary: { Icon: Camera, tone: "fuchsia" },
  milestones: { Icon: Trophy, tone: "amber" },
  agenda: { Icon: Calendar, tone: "orange" },
  conseils: { Icon: Lightbulb, tone: "lime" },
  urgences: { Icon: AlertTriangle, tone: "red" },
  timeline: { Icon: Clock, tone: "indigo" },
  reports: { Icon: FileText, tone: "teal" },
  coach: { Icon: Sparkles, tone: "purple" },
  pediatrician: { Icon: QrCode, tone: "teal" },
  settings: { Icon: Settings, tone: "slate" },
  duo: { Icon: Baby, tone: "pink" },
};

export function getModuleIcon(slug: string): ModuleIconDef {
  return MODULE_ICONS[slug] ?? { Icon: Baby, tone: "pink" };
}

export function ModuleIconCircle({
  slug,
  size = "md",
  className = "",
}: {
  slug: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { Icon, tone } = getModuleIcon(slug);
  const dims =
    size === "lg"
      ? "h-14 w-14"
      : size === "sm"
        ? "h-9 w-9"
        : "h-12 w-12";
  const iconSize =
    size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      aria-hidden
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full ${dims} ${TONE_BG[tone]} ${className}`}
    >
      <Icon className={`${iconSize} ${TONE_FG[tone]}`} strokeWidth={2.2} />
    </span>
  );
}

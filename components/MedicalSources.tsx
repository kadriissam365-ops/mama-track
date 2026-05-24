import { BookOpen } from "lucide-react";

interface Source {
  label: string;
  url: string;
}

interface MedicalSourcesProps {
  sources: Source[];
  intro?: string;
}

export function MedicalSources({ sources, intro }: MedicalSourcesProps) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-300" />
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Sources et r&eacute;f&eacute;rences m&eacute;dicales
        </h3>
      </div>
      {intro ? (
        <p className="text-xs text-blue-900/80 dark:text-blue-100/80 leading-relaxed">{intro}</p>
      ) : (
        <p className="text-xs text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
          Les recommandations affich&eacute;es sur cette page s&apos;appuient sur les sources publiques
          officielles ci-dessous. Elles sont informatives et ne remplacent pas un avis m&eacute;dical
          individualis&eacute;.
        </p>
      )}
      <ul className="text-xs space-y-1 list-disc list-inside text-blue-900 dark:text-blue-100">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-blue-400 hover:text-blue-700 dark:hover:text-blue-50"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

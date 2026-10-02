"use client";
export default function BabyError({ reset }: { error: Error; reset: () => void }) {
  return <div className="mx-auto max-w-lg px-5 py-12 text-center"><h1 className="text-xl font-bold text-foreground">Le carnet fait une petite pause</h1><p className="mt-3 text-sm text-foreground-muted">Nous n’arrivons pas à charger les données pour le moment.</p><button onClick={reset} className="mt-6 min-h-11 rounded-full bg-pink-600 px-6 text-sm font-semibold text-white">Réessayer</button></div>;
}

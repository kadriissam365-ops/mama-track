"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ShieldCheck, Loader2 } from "lucide-react";
import { useFamily } from "@/lib/family";

export default function ImportBabyTrack() {
  const family = useFamily();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <section className="mx-auto max-w-lg px-5 py-8">
    <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950"><Download className="size-6 text-purple-600" /></span>
    <h1 className="text-2xl font-bold text-foreground">Ton suivi BabyTrack, ici</h1>
    <p className="mt-3 text-sm leading-relaxed text-foreground-muted">Connecte ton ancien compte pour récupérer les carnets dont tu es propriétaire : repas, sommeil, croissance, santé et souvenirs.</p>
    <form className="mt-6 space-y-4 rounded-3xl border border-border bg-surface p-6" onSubmit={async event => {
      event.preventDefault(); setPending(true); setError("");
      const form = event.currentTarget;
      const data = new FormData(form);
      try {
        const response = await fetch("/api/enfant/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Réessaie dans un instant.");
        await family.refresh(); router.push("/enfant/dashboard?transfert=1"); router.refresh();
      } catch (error) { setError(error instanceof Error ? error.message : "Le transfert est indisponible."); }
      finally { const password = form.elements.namedItem("password") as HTMLInputElement | null; if (password) password.value = ""; setPending(false); }
    }}>
      <label className="block text-sm font-medium text-foreground" htmlFor="legacy-email">Email de ton ancien compte<input id="legacy-email" name="email" type="email" required maxLength={254} autoComplete="username" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm" /></label>
      <label className="block text-sm font-medium text-foreground" htmlFor="legacy-password">Mot de passe BabyTrack<input id="legacy-password" name="password" type="password" required maxLength={1024} autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm" /></label>
      {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-xs leading-relaxed text-danger-text">{error}</p>}
      <button disabled={pending} type="submit" className="bt-bg-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50">{pending ? <><Loader2 size={16} className="animate-spin" />Transfert en cours…</> : "Récupérer mes carnets"}</button>
    </form>
    <p className="mt-5 flex gap-2 text-xs leading-relaxed text-foreground-muted"><ShieldCheck size={16} className="shrink-0 text-brand" />Le mot de passe sert uniquement à authentifier ton ancien compte pendant ce transfert. Tes données d’origine sont conservées.</p>
    <p className="mt-3 text-xs leading-relaxed text-foreground-muted">Après le transfert, invite tes proches depuis l’espace famille pour leur redonner accès au carnet.</p>
    <Link href="/enfant/dashboard" className="mt-6 block text-center text-sm text-brand underline">Revenir à mon espace bébé</Link>
  </section>;
}

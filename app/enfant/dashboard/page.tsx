import Link from "next/link";
import { redirect } from "next/navigation";
import { Baby, ArrowRight, Heart, Plus, Milk, Moon, Droplets, Ruler, ShieldCheck, Users, Sparkles } from "lucide-react";
import { requireUserAndBaby, formatAge, ageInDays } from "@/lib/enfant/baby";
import { getUserRole } from "@/lib/enfant/baby";
import { ModuleIconCircle } from "@/lib/enfant/module-icons";
import BabyPicker from "@/components/BabyPicker";

export const metadata = { title: "Mon bébé" };

export default async function BabyDashboard() {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) return <section className="mx-auto max-w-xl px-5 py-8">
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-pink-50 via-white to-purple-50 p-7 text-center dark:from-pink-950/30 dark:via-gray-900 dark:to-purple-950/30">
      <span className="mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl bg-white/80 dark:bg-gray-800 shadow-sm"><Baby className="size-10 text-pink-500" /></span>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">Grossesse · Naissance · Premières années</p>
      <h1 className="mt-3 text-3xl font-bold text-foreground">Une app qui grandit avec vous</h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">Repas, sommeil, croissance et petits souvenirs : tout le quotidien de bébé, au même endroit que votre grossesse.</p>
      <Link href="/enfant/naissance" className="bt-bg-gradient mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white"><Plus size={18} />Bébé est né : créer son carnet</Link>
      <Link href="/enfant/import" className="mt-4 block min-h-10 text-sm font-medium text-brand underline underline-offset-4">Récupérer mon ancien suivi BabyTrack</Link>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-3">{[{ slug: "feed", label: "Repas & tétées" }, { slug: "sleep", label: "Siestes & nuits" }, { slug: "growth", label: "Sa croissance" }, { slug: "diary", label: "Vos souvenirs" }].map(item => <div key={item.slug} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"><ModuleIconCircle slug={item.slug} size="sm" /><span className="text-xs font-medium text-foreground">{item.label}</span></div>)}</div>
    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground-muted"><Heart size={14} className="text-brand" />Vos relevés de grossesse sont conservés.</p>
  </section>;

  const cutoff = new Date(new Date().getTime() - 86400000).toISOString();
  const [feeds, sleeps, diapers, measures, role] = await Promise.all([
    supabase.from("feedings").select("kind,amount_ml").eq("baby_id", baby.id).gte("started_at", cutoff),
    supabase.from("sleeps").select("started_at,ended_at").eq("baby_id", baby.id).or(`ended_at.gte.${cutoff},ended_at.is.null`),
    supabase.from("diapers").select("id", { head: true, count: "exact" }).eq("baby_id", baby.id).gte("changed_at", cutoff),
    supabase.from("measurements").select("weight_g,height_cm,measured_at").eq("baby_id", baby.id).order("measured_at", { ascending: false }).limit(1).maybeSingle(),
    getUserRole(user, baby),
  ]);
  if (feeds.error || sleeps.error || diapers.error || measures.error) throw new Error("Le carnet est temporairement indisponible.");
  const now = new Date().getTime();
  const sleepMinutes = Math.round((sleeps.data ?? []).reduce((total, row) => total + Math.max(0, Math.min(row.ended_at ? new Date(row.ended_at).getTime() : now, now) - Math.max(new Date(row.started_at).getTime(), new Date(cutoff).getTime())), 0) / 60000);
  const ml = (feeds.data ?? []).reduce((total, row) => total + (row.amount_ml ?? 0), 0);
  const months = Math.max(0, Math.floor(ageInDays(baby.birth_date) / 30.44));
  const summaries = [
    { slug: "feed", Icon: Milk, label: "Repas", value: String(feeds.data?.length ?? 0), detail: ml ? `${ml} ml enregistrés` : "Tétées, biberons, repas", color: "text-pink-600 bg-pink-50 dark:bg-pink-950/40" },
    { slug: "sleep", Icon: Moon, label: "Sommeil", value: sleepMinutes ? `${Math.floor(sleepMinutes / 60)} h ${String(sleepMinutes % 60).padStart(2, "0")}` : "—", detail: sleeps.data?.some(s => !s.ended_at) ? "Un sommeil est en cours" : "Siestes et nuits", color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
    { slug: "diapers", Icon: Droplets, label: "Couches", value: String(diapers.count ?? 0), detail: "Changes enregistrés", color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40" },
    { slug: "growth", Icon: Ruler, label: "Dernier poids", value: measures.data?.weight_g ? `${(measures.data.weight_g / 1000).toLocaleString("fr-FR")} kg` : "—", detail: measures.data?.measured_at ? new Date(measures.data.measured_at).toLocaleDateString("fr-FR") : "Ajouter une mesure", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  ];
  return <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-6">
    <BabyPicker />
    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-pink-100/70 via-white to-purple-100/70 dark:from-pink-950/40 dark:via-gray-900 dark:to-purple-950/40 p-6 sm:p-8 shadow-[var(--shadow-card)]">
      <span aria-hidden className="absolute -right-10 -top-12 size-48 rounded-full bg-purple-200/20 blur-2xl" />
      <div className="relative flex items-center gap-5"><div className="flex size-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/80 dark:bg-gray-800 text-4xl shadow-sm" aria-hidden>👶</div>
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-brand">Votre petit monde</p><h1 className="mt-1 truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{baby.name}</h1><p className="mt-2 text-sm text-foreground-muted">{formatAge(baby.birth_date)} · {new Date(baby.birth_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p></div>
      </div>
      <Link href="/enfant/milestones" className="relative mt-6 block rounded-2xl bg-white/60 dark:bg-gray-800/50 p-4"><p className="flex justify-between text-xs font-medium text-foreground-muted"><span>Ses premières années</span><span className="text-brand">Voir ses étapes →</span></p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-pink-100 dark:bg-gray-700"><div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400" style={{ width: `${Math.min(100, months / 36 * 100)}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-foreground-subtle"><span>Naissance</span><span>1 an</span><span>2 ans</span><span>3 ans</span></div></Link>
    </div>
    {role === "viewer" && <p className="rounded-2xl bg-info-soft p-3 text-xs text-info-text">Ce carnet est partagé avec toi en lecture seule.</p>}
    {role !== "viewer" && <div><h2 className="mb-3 text-sm font-semibold text-foreground">En un geste</h2><div className="grid grid-cols-4 gap-2 sm:gap-3">{[{ slug: "feed", label: "Un repas" }, { slug: "sleep", label: "Un sommeil" }, { slug: "diapers", label: "Une couche" }, { slug: "diary", label: "Un souvenir" }].map(item => <Link key={item.slug} href={`/enfant/${item.slug}`} className="bt-card-hover flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl border border-border bg-surface p-3"><ModuleIconCircle slug={item.slug} size="sm" /><span className="text-center text-[11px] font-semibold text-foreground">{item.label}</span></Link>)}</div></div>}
    <div><h2 className="mb-3 flex justify-between text-sm font-semibold text-foreground"><span>Le quotidien</span><span className="text-xs font-normal text-foreground-muted">Dernières 24 h</span></h2><div className="grid grid-cols-2 gap-3">{summaries.map(({ Icon, ...item }) => <Link key={item.slug} href={`/enfant/${item.slug}`} className="bt-card-hover rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-xs)]"><div className="flex items-center justify-between"><span className={`flex size-9 items-center justify-center rounded-xl ${item.color}`}><Icon size={18} /></span><ArrowRight size={14} className="text-foreground-subtle" /></div><p className="mt-4 text-xs text-foreground-muted">{item.label}</p><p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p><p className="mt-1 text-[11px] text-foreground-subtle">{item.detail}</p></Link>)}</div></div>
    <div className="grid gap-3 sm:grid-cols-3">{[{ href: "vaccines", label: "Son carnet de santé", desc: "Vaccins et rendez-vous", Icon: ShieldCheck }, { href: "duo", label: "Toute la famille", desc: "Partager son quotidien", Icon: Users }, { href: "coach", label: "Un peu d’aide", desc: "Votre assistant bébé", Icon: Sparkles }].map(({ Icon, ...item }) => <Link key={item.href} href={`/enfant/${item.href}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"><Icon size={20} className="shrink-0 text-brand" /><div><p className="text-xs font-semibold text-foreground">{item.label}</p><p className="mt-1 text-[11px] text-foreground-muted">{item.desc}</p></div></Link>)}</div>
    <Link href="/enfant/plus" className="block rounded-2xl border border-border bg-surface py-4 text-center text-sm font-semibold text-brand">Découvrir tous les outils de bébé →</Link>
  </section>;
}

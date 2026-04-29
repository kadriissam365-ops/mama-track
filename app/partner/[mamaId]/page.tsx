import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createServerClientFromCookies } from "@/lib/supabase";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase-admin";
import { computeAlerts, loadContext, type ContextData } from "@/lib/health-alerts";
import { getWeekData } from "@/lib/pregnancy-data";

export const dynamic = "force-dynamic";

type Role = "papa" | "sagefemme" | "famille";

const ROLE_LABEL: Record<Role, string> = {
  papa: "Papa",
  sagefemme: "Sage-femme",
  famille: "Famille",
};

interface PageProps {
  params: Promise<{ mamaId: string }>;
}

export default async function PartnerDashboardPage({ params }: PageProps) {
  const { mamaId } = await params;
  if (!mamaId) notFound();

  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/partner/" + encodeURIComponent(mamaId));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: accessRow } = await (supabase.from as any)("duo_access")
    .select("role")
    .eq("partner_id", user.id)
    .eq("mama_id", mamaId)
    .maybeSingle();

  const role = (accessRow?.role ?? null) as Role | null;
  if (!role) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-[#3d2b2b] mb-2">Accès refusé</h1>
        <p className="text-sm text-gray-500 mb-6">
          Vous n&apos;avez pas accès à cette grossesse. Demandez à la maman de vous renvoyer une invitation.
        </p>
        <Link href="/duo" className="text-pink-500 underline text-sm">
          Retour au Mode Duo
        </Link>
      </div>
    );
  }

  if (!isAdminConfigured()) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-[#3d2b2b] mb-2">Service indisponible</h1>
        <p className="text-sm text-gray-500">
          Le partage Duo n&apos;est pas configuré côté serveur. Réessayez plus tard.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();
  const ctx = await loadContext(mamaId, admin);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-purple-500 font-semibold">
            Mode Duo · rôle : {ROLE_LABEL[role]}
          </p>
          <h1 className="text-2xl font-bold text-[#3d2b2b]">Tableau de bord</h1>
        </div>
        <Link
          href="/duo"
          className="text-xs px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
        >
          Messagerie Duo
        </Link>
      </header>

      {role === "papa" && <PapaDashboard ctx={ctx} />}
      {role === "sagefemme" && <SagefemmeDashboard ctx={ctx} />}
      {role === "famille" && <FamilleDashboard ctx={ctx} />}
    </div>
  );
}

// -------- role-specific subcomponents (server-rendered, no client state) --------

function WeekBadge({ ctx }: { ctx: ContextData }) {
  const w = ctx.weekSA ?? null;
  const week = w !== null ? getWeekData(w) : null;
  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-5 text-center border border-pink-100">
      {week && <div className="text-5xl mb-2">{week.fruitEmoji}</div>}
      <p className="text-3xl font-bold text-[#3d2b2b]">
        {w !== null ? `${w} SA` : "—"}
      </p>
      {ctx.profile.babyName && (
        <p className="text-sm text-gray-500 mt-1">
          Bébé {ctx.profile.babyName}
        </p>
      )}
      {week && (
        <p className="text-xs text-gray-500 mt-2">
          Taille de {week.fruit} · {week.sizeMm} mm · {week.weightG} g
        </p>
      )}
    </div>
  );
}

function PapaDashboard({ ctx }: { ctx: ContextData }) {
  const babyName = ctx.profile.babyName ?? "bébé";
  const recentKicks = ctx.kicks.slice(0, 5);
  const recentContractions = ctx.contractions.slice(0, 5);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#3d2b2b]">
        Comment va {babyName} ?
      </h2>
      <WeekBadge ctx={ctx} />

      <section className="bg-white rounded-3xl p-5 border border-pink-100">
        <h3 className="font-semibold text-[#3d2b2b] mb-3">Mouvements récents</h3>
        {recentKicks.length === 0 ? (
          <p className="text-sm text-gray-400">Pas encore de comptage de mouvements.</p>
        ) : (
          <ul className="space-y-2">
            {recentKicks.map((k, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{k.date.slice(0, 10)}</span>
                <span className="font-medium text-pink-600">{k.count} mouvements</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentContractions.length > 0 && (
        <section className="bg-white rounded-3xl p-5 border border-pink-100">
          <h3 className="font-semibold text-[#3d2b2b] mb-3">Contractions récentes</h3>
          <ul className="space-y-2">
            {recentContractions.map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{c.date.slice(0, 10)}</span>
                <span className="font-medium text-purple-600">
                  {c.nb} contractions{c.lastInterval ? ` · dernier intervalle ${c.lastInterval} min` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/duo"
        className="block text-center bg-pink-400 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-pink-500 transition-colors"
      >
        Envoyer un message à la maman
      </Link>
    </div>
  );
}

function SagefemmeDashboard({ ctx }: { ctx: ContextData }) {
  const alerts = computeAlerts(ctx);
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#3d2b2b]">Vue clinique</h2>
      <WeekBadge ctx={ctx} />

      {alerts.length > 0 && (
        <section className="space-y-2">
          {alerts.map((a, i) => {
            const colors =
              a.level === "red"
                ? "bg-red-50 border-red-200 text-red-700"
                : a.level === "warn"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-blue-50 border-blue-200 text-blue-700";
            return (
              <div key={i} className={`border rounded-2xl p-3 text-sm ${colors}`}>
                <p className="font-semibold mb-1">{a.source}</p>
                <p>{a.message}</p>
              </div>
            );
          })}
        </section>
      )}

      <section className="bg-white rounded-3xl p-5 border border-purple-100">
        <h3 className="font-semibold text-[#3d2b2b] mb-3">Tension artérielle</h3>
        {ctx.bp.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun relevé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase">
                <th className="pb-2">Date</th>
                <th className="pb-2">Sys/Dia</th>
                <th className="pb-2">Pouls</th>
              </tr>
            </thead>
            <tbody>
              {ctx.bp.slice(0, 7).map((b, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-1.5 text-gray-500">{b.date.slice(0, 10)}</td>
                  <td className="py-1.5 font-medium text-[#3d2b2b]">{b.systolic}/{b.diastolic}</td>
                  <td className="py-1.5 text-gray-500">{b.pulse ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-white rounded-3xl p-5 border border-purple-100">
        <h3 className="font-semibold text-[#3d2b2b] mb-3">Poids — derniers relevés</h3>
        {ctx.weights.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun relevé.</p>
        ) : (
          <ul className="space-y-1.5">
            {ctx.weights.slice(0, 6).map((w, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{w.date.slice(0, 10)}</span>
                <span className="font-medium text-[#3d2b2b]">{w.weight} kg</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-3xl p-5 border border-purple-100">
        <h3 className="font-semibold text-[#3d2b2b] mb-3">Symptômes récents</h3>
        {ctx.symptoms.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun symptôme.</p>
        ) : (
          <ul className="space-y-1.5">
            {ctx.symptoms.slice(0, 6).map((s, i) => (
              <li key={i} className="text-sm">
                <span className="text-gray-500">{s.date.slice(0, 10)}</span> ·{" "}
                <span className="text-[#3d2b2b]">{s.symptoms.join(", ") || "—"}</span>
                {s.severity > 0 && (
                  <span className="text-amber-600"> · sévérité {s.severity}/5</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FamilleDashboard({ ctx }: { ctx: ContextData }) {
  const mamaName = ctx.profile.mamaName ?? "La future maman";
  const babyName = ctx.profile.babyName ?? "bébé";
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-5 text-center border border-pink-100">
        <p className="text-base text-gray-600">
          <strong className="text-[#3d2b2b]">{mamaName}</strong> attend{" "}
          <strong className="text-[#3d2b2b]">{babyName}</strong> 💕
        </p>
      </div>

      <WeekBadge ctx={ctx} />

      {ctx.weekTip && (
        <section className="bg-white rounded-3xl p-5 border border-pink-100">
          <h3 className="font-semibold text-[#3d2b2b] mb-2">Astuce de la semaine</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{ctx.weekTip}</p>
        </section>
      )}

      <Link
        href="/duo"
        className="block text-center bg-pink-100 text-pink-700 px-4 py-3 rounded-2xl font-semibold hover:bg-pink-200 transition-colors"
      >
        Envoyer un message de soutien
      </Link>
    </div>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClientFromCookies } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Role = "papa" | "sagefemme" | "famille";

const ROLE_LABEL: Record<Role, string> = {
  papa: "Papa",
  sagefemme: "Sage-femme",
  famille: "Famille",
};

export default async function PartnerIndexPage() {
  const cookieStore = await cookies();
  const supabase = createServerClientFromCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/partner");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from as any)("duo_access")
    .select("mama_id, role, profiles!duo_access_mama_id_fkey(mama_name, baby_name, due_date)")
    .eq("partner_id", user.id);

  const linked = (rows ?? []) as Array<{
    mama_id: string;
    role: Role;
    profiles?: { mama_name?: string | null; baby_name?: string | null; due_date?: string | null } | null;
  }>;

  if (linked.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 mb-2">Aucune grossesse suivie</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Vous n&apos;avez pas encore accepté d&apos;invitation au Mode Duo.
        </p>
        <Link href="/" className="text-pink-500 underline text-sm">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (linked.length === 1) {
    redirect(`/partner/${linked[0].mama_id}`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#3d2b2b] dark:text-gray-100 mb-1">Vos grossesses suivies</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Sélectionnez une grossesse pour ouvrir le dashboard partenaire.
      </p>
      <div className="space-y-3">
        {linked.map((row) => {
          const name = row.profiles?.mama_name || row.profiles?.baby_name || "Grossesse partagée";
          const role = ROLE_LABEL[row.role] ?? "Partenaire";
          return (
            <Link
              key={row.mama_id}
              href={`/partner/${row.mama_id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl p-4 border border-pink-100 dark:border-pink-900/30 hover:border-pink-300 dark:hover:border-pink-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#3d2b2b] dark:text-gray-100">{name}</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5">Rôle : {role}</p>
                </div>
                <span className="text-pink-400" aria-hidden>›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

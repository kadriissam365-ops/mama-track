import { saveMutation } from "@/lib/enfant/mutations";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ModuleShell } from "@/components/enfant/ModuleShell";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { requirePremium } from "@/lib/enfant/subscription";
import {
  CATEGORY_META,
  FOODS,
  FOOD_RULES,
  GUIDE_SECTIONS,
  MAJOR_ALLERGENS,
  foodsToIntroduceSoon,
  type Food,
  type FoodCategory,
} from "@/lib/enfant/diversification-data";
import { AddFoodIntroForm } from "./AddFoodIntroForm";

export const metadata = { title: "Diversification — MamaTrack" };

type FoodIntro = {
  id: string;
  food_code: string;
  first_tried_at: string;
  status: "ok" | "reaction" | "avoid";
  reaction: string | null;
  notes: string | null;
};

const VALID_VIEWS = new Set(["categories", "allergens", "intros", "guide"]);
const VALID_FOOD_CODES = new Set(FOODS.map((f) => f.code));
const VALID_STATUSES = new Set(["ok", "reaction", "avoid"]);

async function addIntro(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const food_code = String(formData.get("food_code") ?? "");
  if (!VALID_FOOD_CODES.has(food_code)) return;

  const status = String(formData.get("status") ?? "ok");
  const safeStatus = VALID_STATUSES.has(status) ? status : "ok";

  const dateRaw = String(formData.get("first_tried_at") ?? "");
  let first_tried_at = isoDate(new Date());
  if (dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
    first_tried_at = dateRaw;
  }

  const reactionRaw = String(formData.get("reaction") ?? "").trim();
  const reaction = reactionRaw ? reactionRaw.slice(0, 200) : null;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw.slice(0, 500) : null;

  await saveMutation(supabase.from("food_intros").upsert(
    {
      baby_id: baby.id,
      user_id: user.id,
      food_code,
      first_tried_at,
      status: safeStatus,
      reaction,
      notes,
    },
    { onConflict: "baby_id,food_code", ignoreDuplicates: false },
  ));
  revalidatePath("/enfant/diversification");
}

async function deleteIntro(formData: FormData) {
  "use server";
  const { user, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await saveMutation(supabase
    .from("food_intros")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id));
  revalidatePath("/enfant/diversification");
}

async function quickAddIntro(formData: FormData) {
  "use server";
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const food_code = String(formData.get("food_code") ?? "");
  if (!VALID_FOOD_CODES.has(food_code)) return;

  await saveMutation(supabase.from("food_intros").upsert(
    {
      baby_id: baby.id,
      user_id: user.id,
      food_code,
      first_tried_at: isoDate(new Date()),
      status: "ok",
    },
    { onConflict: "baby_id,food_code", ignoreDuplicates: true },
  ));
  revalidatePath("/enfant/diversification");
}

type SearchParams = Promise<{ view?: string; cat?: string }>;

export default async function DiversificationPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : {};
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");
  await requirePremium("diversification");

  const role = await getUserRole(user, baby);
  const canWrite = role === "owner" || role === "caregiver";

  const view = VALID_VIEWS.has(sp.view ?? "")
    ? (sp.view as "categories" | "allergens" | "intros" | "guide")
    : "categories";

  const ageMonths = monthsBetween(baby.birth_date, new Date());

  const { data: introsRaw } = await supabase
    .from("food_intros")
    .select("id, food_code, first_tried_at, status, reaction, notes")
    .eq("baby_id", baby.id)
    .order("first_tried_at", { ascending: false })
    .limit(500);
  const intros = (introsRaw as FoodIntro[] | null) ?? [];
  const triedCodes = intros.map((i) => i.food_code);
  const triedSet = new Set(triedCodes);

  return (
    <ModuleShell
      slug="diversification"
      title="Diversification"
      subtitle={`${baby.name} — ${ageMonths < 4 ? "À démarrer entre 4 et 6 mois" : `${ageMonths} mois`}`}
      viewerBadge={role === "viewer"}
    >
      <ViewTabs current={view} />

      {view === "categories" && (
        <CategoriesView
          ageMonths={ageMonths}
          triedSet={triedSet}
          onQuickAdd={canWrite ? quickAddIntro : undefined}
          selectedCat={(sp.cat as FoodCategory | undefined) ?? null}
        />
      )}

      {view === "allergens" && (
        <AllergensView triedSet={triedSet} ageMonths={ageMonths} />
      )}

      {view === "intros" && (
        <IntrosView
          intros={intros}
          onDelete={canWrite ? deleteIntro : undefined}
        />
      )}

      {view === "guide" && <GuideView ageMonths={ageMonths} />}

      {canWrite && view !== "guide" && (
        <div className="mt-8">
          <AddFoodIntroForm action={addIntro} triedCodes={triedCodes} />
        </div>
      )}

      <p className="mt-10 text-center text-xs text-foreground-muted">
        Repères Santé publique France / SFP. Toujours valider avec ton pédiatre,
        surtout si antécédents allergiques familiaux.
      </p>
    </ModuleShell>
  );
}

// =============================================================
// View tabs
// =============================================================
function ViewTabs({ current }: { current: string }) {
  const tabs = [
    { key: "categories", label: "Aliments", emoji: "🥗" },
    { key: "allergens", label: "Allergènes", emoji: "⚠️" },
    { key: "intros", label: "Mes intros", emoji: "📝" },
    { key: "guide", label: "Guide", emoji: "📖" },
  ];
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.key === current;
        return (
          <Link
            key={t.key}
            href={`/enfant/diversification?view=${t.key}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            <span aria-hidden>{t.emoji}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

// =============================================================
// Categories view
// =============================================================
function CategoriesView({
  ageMonths,
  triedSet,
  onQuickAdd,
  selectedCat,
}: {
  ageMonths: number;
  triedSet: Set<string>;
  onQuickAdd?: (formData: FormData) => void;
  selectedCat: FoodCategory | null;
}) {
  const categories = Object.keys(CATEGORY_META) as FoodCategory[];
  const cats = selectedCat ? [selectedCat] : categories;

  const soon = foodsToIntroduceSoon(ageMonths, triedSet).slice(0, 6);

  return (
    <div className="space-y-8">
      {soon.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
            🌱 À essayer maintenant
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((f) => (
              <FoodCard
                key={f.code}
                food={f}
                tried={false}
                ageMonths={ageMonths}
                onQuickAdd={onQuickAdd}
                highlight
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap gap-2">
          <Link
            href="/enfant/diversification?view=categories"
            className={`rounded-full border px-3 py-1 text-xs transition ${
              !selectedCat
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-foreground-muted hover:text-foreground"
            }`}
          >
            Toutes
          </Link>
          {categories.map((c) => {
            const active = c === selectedCat;
            return (
              <Link
                key={c}
                href={`/enfant/diversification?view=categories&cat=${c}`}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-foreground-muted hover:text-foreground"
                }`}
              >
                <span aria-hidden>{CATEGORY_META[c].emoji}</span>
                {CATEGORY_META[c].label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-6">
          {cats.map((cat) => {
            const meta = CATEGORY_META[cat];
            const foods = FOODS.filter((f) => f.category === cat).sort(
              (a, b) => a.introMonthMin - b.introMonthMin,
            );
            return (
              <div
                key={cat}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {meta.emoji}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {meta.label}
                  </h3>
                </div>
                <p className="mb-4 text-xs text-foreground-muted">
                  {meta.intro}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {foods.map((f) => (
                    <FoodCard
                      key={f.code}
                      food={f}
                      tried={triedSet.has(f.code)}
                      ageMonths={ageMonths}
                      onQuickAdd={onQuickAdd}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FoodCard({
  food,
  tried,
  ageMonths,
  onQuickAdd,
  highlight,
}: {
  food: Food;
  tried: boolean;
  ageMonths: number;
  onQuickAdd?: (formData: FormData) => void;
  highlight?: boolean;
}) {
  const tooYoung = ageMonths < food.introMonthMin;
  const status = tried
    ? { label: "Introduit", cls: "border-success/40 bg-success-soft" }
    : tooYoung
      ? { label: `À partir de ${food.introMonthMin}m`, cls: "border-border bg-background/50 opacity-60" }
      : highlight
        ? { label: "À tester", cls: "border-warning/40 bg-warning-soft" }
        : { label: "Disponible", cls: "border-border bg-surface" };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 ${status.cls}`}
    >
      <div className="text-2xl" aria-hidden>
        {food.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {food.label}
          </span>
          {food.isMajorAllergen && (
            <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning-text">
              Allergène
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[11px] text-foreground-muted">
          {status.label} · {food.introMonthMin}-{food.introMonthMax} mois
        </div>
        {food.prepHint && !tried && !tooYoung && (
          <p className="mt-1 text-[11px] text-foreground-muted">
            {food.prepHint}
          </p>
        )}
      </div>
      {!tried && !tooYoung && onQuickAdd && (
        <form action={onQuickAdd} className="shrink-0">
          <input type="hidden" name="food_code" value={food.code} />
          <button
            type="submit"
            aria-label={`Marquer ${food.label} introduit`}
            className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-strong"
          >
            ✓
          </button>
        </form>
      )}
    </div>
  );
}

// =============================================================
// Allergens view
// =============================================================
function AllergensView({
  triedSet,
  ageMonths,
}: {
  triedSet: Set<string>;
  ageMonths: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
        <h3 className="text-sm font-semibold text-warning-text">
          ⚠️ Allergènes majeurs
        </h3>
        <p className="mt-1 text-xs text-warning-text/80">
          Recommandation EAACI 2020 : introduire les allergènes
          <strong> entre 4 et 6 mois </strong>
          (1 nouvel aliment à la fois, sur 2-3 jours, en petite quantité).
          Surveille rougeurs, vomissements, gonflement, gêne respiratoire.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {MAJOR_ALLERGENS.map((f) => {
          const tried = triedSet.has(f.code);
          const tooYoung = ageMonths < f.introMonthMin;
          return (
            <li
              key={f.code}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                tried
                  ? "border-success/40 bg-success-soft"
                  : tooYoung
                    ? "border-border bg-background/50 opacity-70"
                    : "border-warning/30 bg-warning-soft"
              }`}
            >
              <div className="text-2xl" aria-hidden>
                {f.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">
                  {f.label} {tried && <span aria-hidden>✓</span>}
                </div>
                <div className="text-[11px] text-foreground-muted">
                  À partir de {f.introMonthMin} mois
                </div>
                {f.prepHint && (
                  <p className="mt-1 text-[11px] text-foreground-muted">
                    {f.prepHint}
                  </p>
                )}
                {f.notes && (
                  <p className="mt-1 text-[11px] text-foreground-muted">
                    {f.notes}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
          🚫 À éviter à cet âge
        </h3>
        <ul className="space-y-2">
          {FOOD_RULES.filter((r) => ageMonths < r.until).map((r) => (
            <li
              key={r.rule}
              className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft p-3"
            >
              <span className="text-xl" aria-hidden>
                {r.emoji}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {r.rule}
                </div>
                <p className="text-xs text-foreground-muted">{r.reason}</p>
              </div>
            </li>
          ))}
          {FOOD_RULES.every((r) => ageMonths >= r.until) && (
            <p className="text-sm text-foreground-muted">
              Plus aucune restriction d&apos;âge sur cette liste — bébé peut
              tout goûter (avec bon sens).
            </p>
          )}
        </ul>
      </section>
    </div>
  );
}

// =============================================================
// Intros view
// =============================================================
function IntrosView({
  intros,
  onDelete,
}: {
  intros: FoodIntro[];
  onDelete?: (formData: FormData) => void;
}) {
  if (intros.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground-muted">
        Aucune introduction notée. Utilise le formulaire ci-dessous ou clique
        sur un aliment dans l&apos;onglet « Aliments ».
      </p>
    );
  }
  const ok = intros.filter((i) => i.status === "ok");
  const reactions = intros.filter((i) => i.status === "reaction");
  const avoid = intros.filter((i) => i.status === "avoid");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Bien tolérés" value={ok.length.toString()} />
        <Stat
          label="Réactions"
          value={reactions.length.toString()}
          alert={reactions.length > 0}
        />
        <Stat label="À éviter" value={avoid.length.toString()} />
      </div>

      {reactions.length > 0 && (
        <Section title="⚠️ Réactions" intros={reactions} onDelete={onDelete} />
      )}
      {avoid.length > 0 && (
        <Section title="🚫 À éviter" intros={avoid} onDelete={onDelete} />
      )}
      <Section title="✅ Bien tolérés" intros={ok} onDelete={onDelete} />
    </div>
  );
}

function Section({
  title,
  intros,
  onDelete,
}: {
  title: string;
  intros: FoodIntro[];
  onDelete?: (formData: FormData) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
        {title} ({intros.length})
      </h3>
      <ul className="space-y-2">
        {intros.map((i) => {
          const food = FOODS.find((f) => f.code === i.food_code);
          return (
            <li
              key={i.id}
              className={`flex items-start gap-3 rounded-xl border bg-surface p-3 shadow-sm ${
                i.status === "reaction"
                  ? "border-warning/40"
                  : i.status === "avoid"
                    ? "border-danger/40"
                    : "border-border"
              }`}
            >
              <div className="text-2xl" aria-hidden>
                {food?.emoji ?? "🍽️"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">
                  {food?.label ?? i.food_code}
                </div>
                <div className="text-xs text-foreground-muted">
                  {new Date(i.first_tried_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                {i.reaction && (
                  <p className="mt-1 text-xs text-warning-text">
                    Réaction : {i.reaction}
                  </p>
                )}
                {i.notes && (
                  <p className="mt-1 text-xs text-foreground-muted">
                    {i.notes}
                  </p>
                )}
              </div>
              {onDelete && (
                <form action={onDelete}>
                  <input type="hidden" name="id" value={i.id} />
                  <button
                    type="submit"
                    aria-label="Supprimer"
                    className="text-xs text-foreground-muted hover:text-danger"
                  >
                    ✕
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-4 shadow-sm ${
        alert ? "border-danger/40" : "border-border"
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
        {label}
      </div>
      <div
        className={`mt-1 text-xl font-bold ${
          alert ? "text-danger" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// =============================================================
// Guide view
// =============================================================
function GuideView({ ageMonths }: { ageMonths: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-brand-soft/40 p-5">
        <h3 className="text-base font-semibold text-foreground">
          Bébé a {ageMonths < 1 ? "moins d'un mois" : `${ageMonths} mois`}
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          {ageMonths < 4
            ? "Trop tôt pour la diversification. Lait infantile ou maternel exclusif jusqu'à 4-6 mois."
            : ageMonths < 6
              ? "Fenêtre idéale pour démarrer : purées lisses cuites vapeur, allergènes inclus (œuf, gluten, arachide diluée)."
              : ageMonths < 9
                ? "Texture écrasée à la fourchette. Viandes, poissons, œufs, légumineuses tous accessibles."
                : ageMonths < 12
                  ? "Petits morceaux fondants. Repas à la cuillère + finger food. Lait infantile reste la base."
                  : ageMonths < 24
                    ? "Repas familial adapté. Lait de croissance ou lait entier. Coupe les aliments durs ronds."
                    : "Alimentation quasi-adulte. Limiter sel, sucre, ultra-transformés."}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {GUIDE_SECTIONS.map((s) => (
          <li
            key={s.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {s.emoji}
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                {s.title}
              </h3>
            </div>
            <p className="text-sm text-foreground-muted">{s.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================
// helpers
// =============================================================
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthsBetween(birthDateIso: string, now: Date): number {
  const b = new Date(birthDateIso);
  const days = Math.floor((now.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.floor(days / 30.44));
}

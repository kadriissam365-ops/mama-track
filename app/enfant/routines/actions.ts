"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserAndBaby, getUserRole } from "@/lib/enfant/baby";
import { calendarDate } from "@/lib/family-journey";

async function context(form: FormData) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/naissance");
  const role = await getUserRole(user, baby);
  if (
    (role !== "owner" && role !== "caregiver") ||
    form.get("baby_id") !== baby.id
  )
    redirect("/enfant/routines?error=access");
  return { user, baby, supabase };
}
function saved(error: { code?: string } | null, duplicateOkay = false) {
  if (error && !(duplicateOkay && error.code === "23505"))
    redirect("/enfant/routines?error=save");
  revalidatePath("/enfant/routines");
  revalidatePath("/enfant/dashboard");
}
export async function addRoutine(form: FormData) {
  const { user, baby, supabase } = await context(form);
  const title = String(form.get("title") ?? "").trim();
  const period = String(form.get("period") ?? "anytime");
  if (
    !title ||
    title.length > 100 ||
    !["morning", "evening", "anytime"].includes(period)
  )
    redirect("/enfant/routines?error=invalid");
  const { error } = await supabase
    .from("child_routines")
    .insert({ baby_id: baby.id, user_id: user.id, title, period });
  saved(error);
}
export async function toggleRoutine(form: FormData) {
  const { user, baby, supabase } = await context(form);
  const id = String(form.get("routine_id") ?? "");
  const { data: routine, error: loadError } = await supabase
    .from("child_routines")
    .select("id")
    .eq("id", id)
    .eq("baby_id", baby.id)
    .eq("active", true)
    .maybeSingle();
  if (loadError || !routine) redirect("/enfant/routines?error=save");
  const today = calendarDate();
  if (form.get("done") === "true") {
    const { error } = await supabase
      .from("routine_completions")
      .delete()
      .eq("routine_id", id)
      .eq("baby_id", baby.id)
      .eq("completed_on", today);
    saved(error);
  } else {
    const { error } = await supabase.from("routine_completions").insert({
      routine_id: id,
      baby_id: baby.id,
      user_id: user.id,
      completed_on: today,
    });
    saved(error, true);
  }
}
export async function archiveRoutine(form: FormData) {
  const { baby, supabase } = await context(form);
  const { error } = await supabase
    .from("child_routines")
    .update({ active: form.get("restore") === "true" })
    .eq("id", String(form.get("routine_id") ?? ""))
    .eq("baby_id", baby.id);
  saved(error);
}

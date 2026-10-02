import { NextResponse } from "next/server";
import { createClient } from "@/lib/enfant/supabase/server";
import { safeNextPath } from "@/lib/auth-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next !== "/") return NextResponse.redirect(new URL(next, origin));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [profile, babies] = await Promise.all([
          supabase.from("profiles").select("due_date").eq("id", user.id).maybeSingle(),
          supabase.from("babies").select("id").limit(1),
        ]);
        return NextResponse.redirect(new URL(profile.data?.due_date || babies.data?.length ? "/" : "/onboarding", origin));
      }
    }
  }
  return NextResponse.redirect(new URL("/auth/login?error=auth_callback_error", origin));
}

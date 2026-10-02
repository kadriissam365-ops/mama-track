import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth-redirect";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const publicPaths = ["/auth", "/invite", "/mentions-legales", "/confidentialite", "/cgu", "/api/aasa", "/.well-known", "/apple-app-site-association", "/api/stripe/webhook", "/api/cron", "/api/reports/weekly/cron", "/api/partner-notify/weekly-cron", "/api/enfant/cron", "/enfant/p", "/enfant/duo/join"];
  const isPublic = path === "/" || path === "/offline.html" || publicPaths.some(p => path === p || path.startsWith(p + "/"));
  let result = response;
  if (!user && !isPublic) {
    if (path.startsWith("/api/")) result = NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    else {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("next", path + request.nextUrl.search);
      result = NextResponse.redirect(url);
    }
  } else if (user && ["/auth/login", "/auth/signup"].includes(path)) {
    result = NextResponse.redirect(new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url));
  }
  if (result !== response) response.cookies.getAll().forEach(cookie => result.cookies.set(cookie));
  return result;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|sw\\.js|service-worker\\.js|manifest\\.json).*)"],
};

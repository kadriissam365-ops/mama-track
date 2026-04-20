import { NextResponse } from "next/server";
import { SW_SOURCE } from "@/lib/sw-source";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return new NextResponse(SW_SOURCE, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    },
  });
}

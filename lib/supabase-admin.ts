/**
 * Supabase admin client for trusted server-side cross-user reads.
 *
 * Used by routes/pages that need to fetch a different user's data after
 * verifying the caller's identity and permissions (e.g. partner dashboards
 * via duo_access). NEVER expose the service-role key to the client.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin not configured: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

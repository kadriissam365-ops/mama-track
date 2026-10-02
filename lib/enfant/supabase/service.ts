import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with service_role — bypasses RLS.
 * Only use in server-side code where we want to act on behalf of the system
 * (e.g. accepting invitations, webhooks). Never expose this client to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role env vars");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

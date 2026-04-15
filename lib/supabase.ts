import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (browser)
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (for Route Handlers, Server Components)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServerClientFromCookies(cookieStore: any) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // Handle cookies in Server Components (read-only)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete?.(name) ?? cookieStore.remove?.(name, options)
        } catch {
          // Handle cookies in Server Components (read-only)
        }
      },
    },
  })
}

// Simple client for direct usage (non-SSR contexts)
export const supabase = typeof window !== 'undefined' 
  ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  : createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

// Export types for convenience
export type { Database }

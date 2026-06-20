import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for AUTH only (signup/login/reset), using the public
 * anon/publishable key. Safe to expose — it respects row-level security and has
 * no elevated privileges. (Data reads/writes still go through server routes that
 * use the service-role key and scope by the authenticated user.)
 */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

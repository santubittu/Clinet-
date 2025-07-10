import { createBrowserClient } from "@supabase/ssr"

export function getSupabaseBrowserClient() {
  return createBrowserClient("https://lkepqhkrwbhwzsokhtbm.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

// For client components - lazy-load to avoid build-time initialization
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return browserClient
}

// Deprecated: use getSupabaseBrowserClient() instead
export const supabaseBrowserClient = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get: (target, prop) => {
    return getSupabaseBrowserClient()[prop as keyof ReturnType<typeof createBrowserClient>]
  }
})

// For server actions or API routes (if needed later)
export const createSupabaseServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

// For client components - lazy-load to avoid build-time initialization
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
    }

    browserClient = createBrowserClient(supabaseUrl, supabaseKey)
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  return createClient(supabaseUrl, supabaseKey)
}
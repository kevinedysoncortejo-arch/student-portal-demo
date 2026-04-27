// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

// For client components - lazy-load to avoid build-time initialization
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    // Use environment variables if available, otherwise use fallback values
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmrzefqzvodzrpomhulo.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnplZnF6dm9kenJwb21odWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY2MDQsImV4cCI6MjA5MTczMjYwNH0.qBCVEIV0wNdSPb-pNjTZLWpH5kA2BvTbb-zes-Bxxco'

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
export async function getAuthHeaders() {
  const client = getSupabaseBrowserClient()
  const { data: { session } } = await client.auth.getSession()
  const accessToken = session?.access_token

  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }
}


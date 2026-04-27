// lib/supabase/server-client.ts
import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export const createSupabaseServerClient = (request?: NextRequest) => {
  // Use environment variables if available, otherwise use fallback values
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmrzefqzvodzrpomhulo.supabase.co'
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnplZnF6dm9kenJwb21odWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTY2MDQsImV4cCI6MjA5MTczMjYwNH0.qBCVEIV0wNdSPb-pNjTZLWpH5kA2BvTbb-zes-Bxxco'

  const requestAuthorization = request?.headers.get('authorization')
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: requestAuthorization ? { Authorization: requestAuthorization } : {},
    },
  })

  return supabase
}
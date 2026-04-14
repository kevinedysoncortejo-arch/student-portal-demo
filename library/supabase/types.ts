// lib/supabase/types.ts
export type AuthError = {
  message: string
}

export type AuthResponse = {
  error: AuthError | null
  success: boolean
  user?: any
}
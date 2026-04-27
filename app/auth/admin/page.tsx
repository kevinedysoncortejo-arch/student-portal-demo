// app/auth/admin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/library/supabase/client'

export default function AdminAuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const client = getSupabaseBrowserClient()
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setMessage({ type: 'error', text: error.message })
        clearMessage()
      } else if (data.user) {
        // Check if user is admin
        const { data: profile } = await client
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          setMessage({ type: 'success', text: 'Admin login successful! Redirecting...' })
          clearMessage()
          // Redirect to admin dashboard after successful login
          setTimeout(() => router.push('/admin/dashboard'), 1000)
        } else if (!profile) {
          // Profile doesn't exist, create it with admin role
          const { error: createError } = await client
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: 'admin'
            })

          if (createError) {
            console.error('Error creating admin profile:', createError)
            setMessage({ type: 'error', text: 'Failed to create admin profile. Please contact support.' })
            clearMessage()
            await client.auth.signOut()
          } else {
            setMessage({ type: 'success', text: 'Admin account created and login successful! Redirecting...' })
            clearMessage()
            setTimeout(() => router.push('/admin/dashboard'), 1000)
          }
        } else {
          setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' })
          clearMessage()
          // Sign out the user
          await client.auth.signOut()
        }
      } else {
        setMessage({ type: 'error', text: 'Login failed. Check your credentials and try again.' })
        clearMessage()
      }
    } catch (error) {
      console.error('Login exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessage({
        type: 'error',
        text: `Unable to log in: ${errorMessage}`,
      })
      clearMessage()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to admin panel</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email Address
            </label>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : 'Admin Login'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/auth"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Regular User Login
          </a>
        </div>
      </div>
    </div>
  )
}
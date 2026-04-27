// app/admin/dashboard/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/library/supabase/client'
import { User, LogOut, Home, Users, FileText, Settings, Bell } from 'lucide-react'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const client = getSupabaseBrowserClient()
      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        router.push('/auth/admin')
        return
      }

      // Check if user is admin
      const { data: profile } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/auth')
        return
      }

      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    const client = getSupabaseBrowserClient()
    await client.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-red-600 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-xl font-bold text-white">
                <Home className="w-6 h-6" />
                Admin Portal
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard/users"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 rounded-md"
              >
                <Users className="w-4 h-4" />
                Users
              </Link>
              <Link
                href="/admin/dashboard/articles"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 rounded-md"
              >
                <FileText className="w-4 h-4" />
                Articles
              </Link>
              <Link
                href="/admin/dashboard/notifications"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 rounded-md"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
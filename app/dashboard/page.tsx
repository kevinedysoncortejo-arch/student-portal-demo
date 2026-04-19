// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowserClient } from '@/library/supabase/client'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseBrowserClient.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <p className="mt-1 text-sm text-gray-900">{user.id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Created At</label>
          <p className="mt-1 text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
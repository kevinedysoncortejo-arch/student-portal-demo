// app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/library/supabase/client'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalComments: 0,
    totalLikes: 0
  })

  useEffect(() => {
    const getUser = async () => {
      const client = getSupabaseBrowserClient()
      const { data: { user } } = await client.auth.getUser()
      setUser(user)
    }
    getUser()

    // Fetch stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const client = getSupabaseBrowserClient()

    try {
      // Get total users
      const { count: userCount } = await client
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get total articles
      const { count: articleCount } = await client
        .from('articles')
        .select('*', { count: 'exact', head: true })

      // Get total comments
      const { count: commentCount } = await client
        .from('comments')
        .select('*', { count: 'exact', head: true })

      // Get total likes
      const { count: likeCount } = await client
        .from('likes')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: userCount || 0,
        totalArticles: articleCount || 0,
        totalComments: commentCount || 0,
        totalLikes: likeCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-900">Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Articles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalArticles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">C</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Comments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalComments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">L</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Likes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalLikes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/admin/dashboard/articles"
            className="block rounded-lg border border-gray-200 p-5 hover:border-red-600 hover:bg-red-50 transition"
          >
            <p className="text-base font-semibold text-gray-900">Manage Articles</p>
            <p className="mt-2 text-sm text-gray-600">Create, edit, and delete articles from the admin portal.</p>
          </a>
          <a
            href="/admin/dashboard/users"
            className="block rounded-lg border border-gray-200 p-5 hover:border-red-600 hover:bg-red-50 transition"
          >
            <p className="text-base font-semibold text-gray-900">Review Users</p>
            <p className="mt-2 text-sm text-gray-600">View registered users and manage admin access.</p>
          </a>
        </div>
      </div>
    </div>
  )
}
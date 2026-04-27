// app/page.tsx
'use client'

import Link from 'next/link'
import { ArrowRight, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Article {
  id: number
  title: string
  content: string
  author_id: string
  created_at: string
  profiles: {
    email: string
  }
  likeCount: number
}

export default function LandingPage() {
  const [topArticles, setTopArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopArticles()
  }, [])

  const fetchTopArticles = async () => {
    try {
      const response = await fetch('/api/top-articles', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        console.error('Top articles endpoint returned error:', data)
        setError('Unable to load top articles. Showing fallback articles.')
        if (data?.articles) {
          setTopArticles(data.articles)
        }
        return
      }

      if (data.articles) {
        setTopArticles(data.articles)
      } else {
        setError('No articles were returned from the server.')
      }
    } catch (error) {
      console.error('Error fetching top articles:', error)
      setError('Unable to load top articles. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Student Portal Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A simple integrated web app using Supabase and Vercel.
            <br />
            Manage your learning journey with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
            >
              User Login
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/admin"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md"
            >
              Admin Login
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Top Articles Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Top 5 Most Liked Articles</h2>
          {loading ? (
            <div className="text-center py-8">Loading articles...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : topArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No articles found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topArticles.map((article, index) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-1 text-red-600">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{article.likeCount}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {article.content}
                  </p>
                  <div className="text-xs text-gray-500">
                    By {article.profiles?.email || 'Unknown'} • {new Date(article.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
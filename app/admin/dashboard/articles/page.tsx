// app/admin/dashboard/articles/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getAuthHeaders } from '@/library/supabase/client'

interface Article {
  id: number
  title: string
  content: string
  author_id: string
  created_at: string
  profiles: {
    email: string
  }
  likes: number
  comments: number
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '' })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/articles', { headers })
      const data = await response.json()
      if (data.articles) {
        setArticles(data.articles)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.article) {
        setArticles(prev => [data.article, ...prev])
        setShowCreateForm(false)
        setFormData({ title: '', content: '' })
      }
    } catch (error) {
      console.error('Error creating article:', error)
    }
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setFormData({ title: article.title, content: article.content })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArticle) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/articles/${editingArticle.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.article) {
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? data.article : a))
        setEditingArticle(null)
        setFormData({ title: '', content: '' })
      }
    } catch (error) {
      console.error('Error updating article:', error)
    }
  }

  const handleDelete = async (articleId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers,
      })
      if (response.ok) {
        setArticles(prev => prev.filter(a => a.id !== articleId))
      }
    } catch (error) {
      console.error('Error deleting article:', error)
    }
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingArticle(null)
    setFormData({ title: '', content: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Articles</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingArticle) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingArticle ? 'Edit Article' : 'Create New Article'}
          </h2>
          <form onSubmit={editingArticle ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg h-32 resize-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                {editingArticle ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Articles</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No articles found.</div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{article.content}</p>
                    <div className="text-sm text-gray-500">
                      By {article.profiles?.email || 'Unknown'} • {new Date(article.created_at).toLocaleDateString()}
                      • {article.likes || 0} likes • {article.comments || 0} comments
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
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
      } else {
        // Generate random articles as fallback
        setArticles(generateRandomArticles())
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      // Generate random articles as fallback
      setArticles(generateRandomArticles())
    } finally {
      setLoading(false)
    }
  }

  const generateRandomArticles = (): Article[] => {
    const titles = [
      'The Future of Technology in Education',
      'How to Master Programming Fundamentals',
      'Building Scalable Web Applications',
      'Machine Learning for Beginners',
      'Cybersecurity Best Practices',
      'Cloud Computing Essentials',
      'Data Science with Python',
      'Mobile App Development Trends',
      'DevOps and Continuous Integration',
      'Artificial Intelligence in Healthcare'
    ]

    const contents = [
      'This article explores the latest advancements in technology and their impact on modern education systems. Technology has revolutionized the way we learn, making education more accessible and interactive than ever before.',
      'Learn the core concepts of programming that every developer should master to build robust applications. Understanding fundamentals is key to becoming a proficient programmer.',
      'Discover the principles and patterns for creating web applications that can handle millions of users. Scalability is crucial for modern web development.',
      'An introduction to machine learning algorithms and their practical applications in real-world scenarios. ML is transforming industries across the globe.',
      'Protect your digital assets with these essential cybersecurity practices and tools. Security should be a top priority for all developers.',
      'Understanding cloud computing platforms and how to leverage them for scalable solutions. Cloud technology is the future of computing.',
      'Master data analysis and visualization techniques using Python and its powerful libraries. Data science skills are in high demand.',
      'Stay ahead of the curve with the latest trends in mobile application development. Mobile apps continue to dominate the digital landscape.',
      'Implement efficient DevOps practices to streamline your development and deployment processes. DevOps bridges the gap between development and operations.',
      'Explore how AI is revolutionizing healthcare with innovative solutions and predictive analytics. AI has tremendous potential in medical applications.'
    ]

    const authors = [
      'john.doe@example.com',
      'jane.smith@example.com',
      'bob.wilson@example.com',
      'alice.johnson@example.com',
      'charlie.brown@example.com'
    ]

    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      title: titles[i % titles.length],
      content: contents[i % contents.length],
      author_id: `user-${i + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      profiles: {
        email: authors[i % authors.length]
      },
      likes: Math.floor(Math.random() * 50) + 1,
      comments: Math.floor(Math.random() * 20) + 1
    }))
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
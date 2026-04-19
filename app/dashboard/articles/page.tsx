// app/dashboard/articles/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Copy } from 'lucide-react'

// Sample articles data
const sampleArticles = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    content: "Next.js is a powerful React framework that makes building web applications easier. It provides features like server-side rendering, static site generation, and API routes out of the box.",
    author: "John Doe",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Understanding React Hooks",
    content: "React Hooks are functions that let you use state and other React features in functional components. They make it easier to manage component state and lifecycle.",
    author: "Jane Smith",
    date: "2024-01-20",
  },
  {
    id: 3,
    title: "Building with Supabase",
    content: "Supabase is an open-source Firebase alternative. It provides a real-time database, authentication, and storage with a simple API.",
    author: "Bob Johnson",
    date: "2024-01-25",
  },
  {
    id: 4,
    title: "Tailwind CSS Best Practices",
    content: "Tailwind CSS is a utility-first CSS framework that helps you build custom designs quickly. Learn the best practices for organizing your styles.",
    author: "Alice Brown",
    date: "2024-01-30",
  },
  {
    id: 5,
    title: "TypeScript in React",
    content: "TypeScript adds static typing to JavaScript, making your React code more robust and easier to maintain. Here's how to get started.",
    author: "Charlie Wilson",
    date: "2024-02-05",
  },
]

interface Comment {
  id: number
  text: string
  author: string
  date: string
  replies: Comment[]
}

export default function ArticlesPage() {
  const [likes, setLikes] = useState<{ [key: number]: number }>({})
  const [userLikes, setUserLikes] = useState<{ [key: number]: boolean }>({})
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({})
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({})
  const [replyingTo, setReplyingTo] = useState<{ articleId: number; commentId: number } | null>(null)
  const [newReply, setNewReply] = useState('')
  const [notifications, setNotifications] = useState<string[]>([])
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    // Load likes from localStorage
    const savedLikes = localStorage.getItem('articleLikes')
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes))
    }

    const savedUserLikes = localStorage.getItem('userLikes')
    if (savedUserLikes) {
      setUserLikes(JSON.parse(savedUserLikes))
    }
  }, [])

  const handleLike = (articleId: number) => {
    const newUserLikes = { ...userLikes }
    const newLikes = { ...likes }

    if (newUserLikes[articleId]) {
      newLikes[articleId] = (newLikes[articleId] || 0) - 1
      delete newUserLikes[articleId]
    } else {
      newLikes[articleId] = (newLikes[articleId] || 0) + 1
      newUserLikes[articleId] = true
      // Add notification
      setNotifications(prev => [...prev, `You liked "${sampleArticles.find(a => a.id === articleId)?.title}"`])
    }

    setLikes(newLikes)
    setUserLikes(newUserLikes)

    // Save to localStorage
    localStorage.setItem('articleLikes', JSON.stringify(newLikes))
    localStorage.setItem('userLikes', JSON.stringify(newUserLikes))
  }

  const handleReply = (articleId: number, commentId: number) => {
    const replyText = newReply.trim()
    if (!replyText) return

    const newReplyComment: Comment = {
      id: Date.now(),
      text: replyText,
      author: "You",
      date: new Date().toISOString().split('T')[0],
      replies: []
    }

    setComments(prev => ({
      ...prev,
      [articleId]: prev[articleId].map(comment => {
        if (comment.id === commentId) {
          return { ...comment, replies: [...comment.replies, newReplyComment] }
        }
        return comment
      })
    }))

    setNewReply('')
    setReplyingTo(null)

    // Add notification
    setNotifications(prev => [...prev, `You replied to a comment on "${sampleArticles.find(a => a.id === articleId)?.title}"`])
  }

  const startReply = (articleId: number, commentId: number) => {
    setReplyingTo({ articleId, commentId })
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setNewReply('')
  }

  const handleShare = (articleId: number) => {
    const url = `${window.location.origin}/dashboard/articles#article-${articleId}`
    navigator.clipboard.writeText(url)
    setNotifications(prev => [...prev, `Link copied to clipboard for "${sampleArticles.find(a => a.id === articleId)?.title}"`])
  }

  const toggleComments = (articleId: number) => {
    setShowComments(prev => ({ ...prev, [articleId]: !prev[articleId] }))
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Notifications</h3>
          <ul className="space-y-1">
            {notifications.slice(-3).map((notif, index) => (
              <li key={index} className="text-sm text-blue-700">{notif}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">Top 5 sample articles</p>
        </div>
        <div className="divide-y divide-gray-200">
          {sampleArticles.map((article) => (
            <div key={article.id} id={`article-${article.id}`} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h2>
                  <p className="text-gray-600 mb-3">{article.content}</p>
                  <div className="text-sm text-gray-500">
                    By {article.author} on {article.date}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => handleLike(article.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    userLikes[article.id]
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${userLikes[article.id] ? 'fill-current' : ''}`} />
                  {likes[article.id] || 0}
                </button>

                <button
                  onClick={() => toggleComments(article.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  {(comments[article.id]?.length || 0)}
                </button>

                <button
                  onClick={() => handleShare(article.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* Comments Section */}
              {showComments[article.id] && (
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-3">
                    {comments[article.id]?.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {comment.author} on {comment.date}
                            </p>
                            <button
                              onClick={() => startReply(article.id, comment.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              Reply
                            </button>
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-3 ml-4 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-white rounded p-2 border-l-2 border-gray-200">
                                <p className="text-sm text-gray-900">{reply.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {reply.author} on {reply.date}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo?.articleId === article.id && replyingTo?.commentId === comment.id && (
                          <div className="mt-3 ml-4">
                            <textarea
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleReply(article.id, comment.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Reply
                              </button>
                              <button
                                onClick={cancelReply}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="mt-3">
                    <textarea
                      value={newComments[article.id] || ''}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [article.id]: e.target.value }))}
                      placeholder="Add a comment..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={2}
                    />
                    <button
                      onClick={() => handleComment(article.id)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
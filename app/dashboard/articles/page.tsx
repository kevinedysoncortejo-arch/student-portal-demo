// app/dashboard/articles/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Send } from 'lucide-react'
import { getAuthHeaders } from '@/library/supabase/client'

interface Comment {
  id: number
  content: string
  user_id: string
  article_id: number
  parent_id: number | null
  created_at: string
  profiles: {
    email: string
  }
  replies?: Comment[]
}

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
  commentCount: number
  isLiked?: boolean
  comments?: Comment[]
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({})
  const [replyingTo, setReplyingTo] = useState<{ articleId: number; commentId: number | null } | null>(null)
  const [replyContent, setReplyContent] = useState('')

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

  const handleLike = async (articleId: number) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ article_id: articleId }),
      })

      if (response.ok) {
        const data = await response.json()
        setArticles(articles.map(article =>
          article.id === articleId
            ? { ...article, likeCount: data.likeCount, isLiked: data.liked }
            : article
        ))
      }
    } catch (error) {
      console.error('Error liking article:', error)
    }
  }

  const handleComment = async (articleId: number) => {
    const content = newComments[articleId]
    if (!content?.trim()) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          article_id: articleId,
          content: content.trim(),
          parent_id: null
        }),
      })

      if (response.ok) {
        setNewComments({ ...newComments, [articleId]: '' })
        fetchArticles() // Refresh to get updated comment count
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleReply = async (articleId: number, parentId: number) => {
    if (!replyContent.trim()) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          article_id: articleId,
          content: replyContent.trim(),
          parent_id: parentId
        }),
      })

      if (response.ok) {
        setReplyContent('')
        setReplyingTo(null)
        fetchArticles() // Refresh to get updated comment count
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const toggleComments = async (articleId: number) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId)
    } else {
      newExpanded.add(articleId)
      // Fetch comments if not already loaded
      await fetchComments(articleId)
    }
    setExpandedComments(newExpanded)
  }

  const fetchComments = async (articleId: number) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/comments?article_id=${articleId}`, { headers })
      const data = await response.json()
      if (data.comments) {
        setArticles(articles.map(article =>
          article.id === articleId
            ? { ...article, comments: data.comments }
            : article
        ))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleShare = async (article: Article) => {
    const shareData = {
      title: article.title,
      text: article.content.substring(0, 100) + '...',
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Error sharing:', error)
        fallbackShare(article)
      }
    } else {
      fallbackShare(article)
    }
  }

  const fallbackShare = (article: Article) => {
    const url = window.location.href
    navigator.clipboard.writeText(`${article.title}\n\n${article.content}\n\n${url}`)
    alert('Article link copied to clipboard!')
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white shadow rounded-lg'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h1 className='text-2xl font-bold text-gray-900'>Articles</h1>
          <p className='text-gray-600'>Latest articles from the community</p>
        </div>
        <div className='divide-y divide-gray-200'>
          {loading ? (
            <div className='p-6 text-center'>Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className='p-6 text-center text-gray-500'>No articles found.</div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className='p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>{article.title}</h2>
                <p className='text-gray-600 mb-4'>{article.content}</p>
                <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                  <span>By {article.profiles?.email || 'Unknown'} on {new Date(article.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className='flex items-center gap-4 mb-4'>
                  <button
                    onClick={() => handleLike(article.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      article.isLiked
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${article.isLiked ? 'fill-current' : ''}`} />
                    {article.likeCount}
                  </button>

                  <button
                    onClick={() => toggleComments(article.id)}
                    className='flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {article.commentCount}
                  </button>

                  <button
                    onClick={() => handleShare(article)}
                    className='flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                  >
                    <Share2 className='w-4 h-4' />
                    Share
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments.has(article.id) && (
                  <div className='border-t pt-4 mt-4'>
                    <h3 className='text-lg font-medium mb-4'>Comments</h3>

                    {/* Add Comment */}
                    <div className='mb-4'>
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          value={newComments[article.id] || ''}
                          onChange={(e) => setNewComments({ ...newComments, [article.id]: e.target.value })}
                          placeholder='Write a comment...'
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(article.id)}
                        />
                        <button
                          onClick={() => handleComment(article.id)}
                          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                          <Send className='w-4 h-4' />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {article.comments && article.comments.length > 0 ? (
                      <div className='space-y-4'>
                        {article.comments.map((comment: Comment) => (
                          <div key={comment.id} className='border-l-2 border-gray-200 pl-4'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <span className='font-medium text-sm'>{comment.profiles?.email || 'Anonymous'}</span>
                                  <span className='text-xs text-gray-500'>
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className='text-gray-700 mb-2'>{comment.content}</p>

                                {/* Reply Button */}
                                <button
                                  onClick={() => setReplyingTo({ articleId: article.id, commentId: comment.id })}
                                  className='text-xs text-blue-600 hover:text-blue-800'
                                >
                                  Reply
                                </button>

                                {/* Reply Input */}
                                {replyingTo?.articleId === article.id && replyingTo?.commentId === comment.id && (
                                  <div className='mt-2 flex gap-2'>
                                    <input
                                      type='text'
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder='Write a reply...'
                                      className='flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                                      onKeyPress={(e) => e.key === 'Enter' && handleReply(article.id, comment.id)}
                                    />
                                    <button
                                      onClick={() => handleReply(article.id, comment.id)}
                                      className='px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
                                    >
                                      Reply
                                    </button>
                                    <button
                                      onClick={() => setReplyingTo(null)}
                                      className='px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400'
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className='mt-3 space-y-2'>
                                    {comment.replies.map((reply: Comment) => (
                                      <div key={reply.id} className='border-l-2 border-gray-100 pl-3 bg-gray-50 rounded p-2'>
                                        <div className='flex items-center gap-2 mb-1'>
                                          <span className='font-medium text-xs'>{reply.profiles?.email || 'Anonymous'}</span>
                                          <span className='text-xs text-gray-500'>
                                            {new Date(reply.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className='text-gray-600 text-sm'>{reply.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-gray-500 text-sm'>No comments yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

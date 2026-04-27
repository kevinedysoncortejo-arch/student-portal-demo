// app/api/articles/route.ts
import { createSupabaseServerClient } from '@/library/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id (
          email
        ),
        likes:likes(count),
        comments:comments(count)
      `)
      .order('created_at', { ascending: false })

    // If database is empty or tables don't exist, return mock data
    if (error || !articles || articles.length === 0) {
      console.log('Database empty or not set up, returning mock data')
      const mockArticles = [
        {
          id: 1,
          title: "Welcome to Our Student Portal",
          content: "This is your gateway to academic success. Here you'll find resources, articles, and tools to help you excel in your studies. Stay connected with your peers and access the latest information about your courses.",
          author_id: "demo-user",
          created_at: new Date().toISOString(),
          profiles: { email: "admin@portal.com" },
          likes: [{ count: 5 }],
          comments: [{ count: 2 }],
          likeCount: 5,
          commentCount: 2,
          isLiked: false
        },
        {
          id: 2,
          title: "Study Tips for Better Grades",
          content: "Effective study habits can make a significant difference in your academic performance. Try the Pomodoro technique, create a dedicated study space, and don't forget to take regular breaks. Consistency is key to success.",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profiles: { email: "student@portal.com" },
          likes: [{ count: 8 }],
          comments: [{ count: 3 }],
          likeCount: 8,
          commentCount: 3,
          isLiked: false
        },
        {
          id: 3,
          title: "Campus Events This Semester",
          content: "Don't miss out on exciting events happening around campus! From guest lectures to cultural festivals, there's something for everyone. Check the events calendar regularly to stay updated on upcoming activities.",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          profiles: { email: "events@portal.com" },
          likes: [{ count: 12 }],
          comments: [{ count: 5 }],
          likeCount: 12,
          commentCount: 5,
          isLiked: false
        },
        {
          id: 4,
          title: "Time Management for Students",
          content: "Balancing coursework, extracurricular activities, and personal life can be challenging. Learn to prioritize tasks, use a planner, and set realistic goals. Remember that quality time management leads to better work-life balance.",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          profiles: { email: "advisor@portal.com" },
          likes: [{ count: 15 }],
          comments: [{ count: 7 }],
          likeCount: 15,
          commentCount: 7,
          isLiked: false
        },
        {
          id: 5,
          title: "Career Development Resources",
          content: "Planning for your future career starts now. Take advantage of career counseling services, internship opportunities, and networking events. Build your resume and gain valuable experience through various programs available on campus.",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 345600000).toISOString(),
          profiles: { email: "career@portal.com" },
          likes: [{ count: 20 }],
          comments: [{ count: 9 }],
          likeCount: 20,
          commentCount: 9,
          isLiked: false
        }
      ]

      return NextResponse.json({ articles: mockArticles })
    }

    // Add like status for current user
    let articlesWithLikeStatus = articles
    if (user) {
      const articleIds = articles.map(article => article.id)
      const { data: userLikes } = await supabase
        .from('likes')
        .select('article_id')
        .eq('user_id', user.id)
        .in('article_id', articleIds)

      const likedArticleIds = new Set(userLikes?.map(like => like.article_id) || [])

      articlesWithLikeStatus = articles.map(article => ({
        ...article,
        likeCount: article.likes?.[0]?.count || 0,
        commentCount: article.comments?.[0]?.count || 0,
        isLiked: likedArticleIds.has(article.id)
      }))
    } else {
      articlesWithLikeStatus = articles.map(article => ({
        ...article,
        likeCount: article.likes?.[0]?.count || 0,
        commentCount: article.comments?.[0]?.count || 0,
        isLiked: false
      }))
    }

    return NextResponse.json({ articles: articlesWithLikeStatus })
  } catch (error) {
    console.error('Server error:', error)
    const mockArticles = [
      {
        id: 1,
        title: "Welcome to Our Student Portal",
        content: "This is your gateway to academic success. Here you'll find resources, articles, and tools to help you excel in your studies. Stay connected with your peers and access the latest information about your courses.",
        author_id: "demo-user",
        created_at: new Date().toISOString(),
        profiles: { email: "admin@portal.com" },
        likes: [{ count: 5 }],
        comments: [{ count: 2 }],
        likeCount: 5,
        commentCount: 2,
        isLiked: false
      },
      {
        id: 2,
        title: "Study Tips for Better Grades",
        content: "Effective study habits can make a significant difference in your academic performance. Try the Pomodoro technique, create a dedicated study space, and don't forget to take regular breaks. Consistency is key to success.",
        author_id: "demo-user",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { email: "student@portal.com" },
        likes: [{ count: 8 }],
        comments: [{ count: 3 }],
        likeCount: 8,
        commentCount: 3,
        isLiked: false
      }
    ]

    return NextResponse.json({ articles: mockArticles })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        content,
        author_id: user.id
      })
      .select(`
        *,
        profiles:author_id (
          email
        ),
        likes:likes(count),
        comments:comments(count)
      `)
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send notification to all users about new article
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id) // Don't notify the author

      if (users && users.length > 0) {
        const notifications = users.map(userProfile => ({
          type: 'new_article',
          message: `A new article "${title}" has been published`,
          user_id: userProfile.id,
          article_id: article.id
        }))

        await supabase
          .from('notifications')
          .insert(notifications)

        console.log(`New article notification sent to ${users.length} users: "${title}"`)
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
      // Don't fail the article creation if notification fails
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const articleId = url.pathname.split('/').pop()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update({ title, content })
      .eq('id', articleId)
      .select(`
        *,
        profiles:author_id (
          email
        ),
        likes:likes(count),
        comments:comments(count)
      `)
      .single()

    if (error) {
      console.error('Error updating article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const articleId = url.pathname.split('/').pop()

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId)

    if (error) {
      console.error('Error deleting article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
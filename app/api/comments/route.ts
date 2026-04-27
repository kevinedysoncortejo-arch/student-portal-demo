// app/api/comments/route.ts
import { createSupabaseServerClient } from '@/library/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const article_id = searchParams.get('article_id')

    if (!article_id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient(request)

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          email
        ),
        replies:comments!parent_id (
          *,
          profiles:user_id (
            email
          )
        )
      `)
      .eq('article_id', article_id)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { article_id, content, parent_id } = await request.json()

    if (!article_id || !content) {
      return NextResponse.json({ error: 'Article ID and content are required' }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        article_id,
        user_id: user.id,
        content,
        parent_id: parent_id || null
      })
      .select(`
        *,
        profiles:user_id (
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for article author
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('title, author_id')
      .eq('id', article_id)
      .single()

    if (!articleError && article && article.author_id !== user.id) {
      try {
        await supabase.from('notifications').insert({
          type: 'comment',
          message: `Someone commented on your article "${article.title}"`,
          user_id: article.author_id,
          article_id: article_id
        })
      } catch (notificationError) {
        console.error('Error creating comment notification:', notificationError)
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
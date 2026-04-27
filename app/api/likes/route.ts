// app/api/likes/route.ts
import { createSupabaseServerClient } from '@/library/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { article_id } = await request.json()

    if (!article_id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('article_id', article_id)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike: delete the like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) {
        console.error('Error unliking article:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Get updated like count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', article_id)

      return NextResponse.json({ liked: false, likeCount: count || 0 })
    } else {
      // Like: create the like
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          article_id,
          user_id: user.id
        })

      if (insertError) {
        console.error('Error liking article:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
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
            type: 'like',
            message: `Someone liked your article "${article.title}"`,
            user_id: article.author_id,
            article_id: article_id
          })
        } catch (notificationError) {
          console.error('Error creating like notification:', notificationError)
        }
      }

      // Get updated like count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', article_id)

      return NextResponse.json({ liked: true, likeCount: count || 0 })
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const article_id = searchParams.get('article_id')

    if (!article_id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Check if user liked this article
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('article_id', article_id)
      .eq('user_id', user.id)
      .single()

    // Get like count
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', article_id)

    return NextResponse.json({
      liked: !!like,
      likeCount: count || 0
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
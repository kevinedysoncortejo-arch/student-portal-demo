// app/api/top-articles/route.ts
import { createSupabaseServerClient } from '@/library/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)

    // Get articles with like counts, ordered by likes descending
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        profiles:author_id (
          email
        ),
        likes:likes(count)
      `)
      .order('created_at', { ascending: false })
      .limit(20) // Get more to sort by likes

    // If database is empty, return mock data
    if (error || !articles || articles.length === 0) {
      console.log('Database empty, returning mock top articles')
      const mockTopArticles = [
        {
          id: 5,
          title: "Career Development Resources",
          content: "Planning for your future career starts now. Take advantage of career counseling services, internship opportunities, and networking events...",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 345600000).toISOString(),
          profiles: { email: "career@portal.com" },
          likeCount: 20
        },
        {
          id: 4,
          title: "Time Management for Students",
          content: "Balancing coursework, extracurricular activities, and personal life can be challenging. Learn to prioritize tasks...",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          profiles: { email: "advisor@portal.com" },
          likeCount: 15
        },
        {
          id: 3,
          title: "Campus Events This Semester",
          content: "Don't miss out on exciting events happening around campus! From guest lectures to cultural festivals...",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          profiles: { email: "events@portal.com" },
          likeCount: 12
        },
        {
          id: 2,
          title: "Study Tips for Better Grades",
          content: "Effective study habits can make a significant difference in your academic performance...",
          author_id: "demo-user",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profiles: { email: "student@portal.com" },
          likeCount: 8
        },
        {
          id: 1,
          title: "Welcome to Our Student Portal",
          content: "This is your gateway to academic success. Here you'll find resources, articles, and tools...",
          author_id: "demo-user",
          created_at: new Date().toISOString(),
          profiles: { email: "admin@portal.com" },
          likeCount: 5
        }
      ]

      return NextResponse.json({ articles: mockTopArticles })
    }

    // Sort by likes count and take top 5
    const sortedArticles = articles
      .map(article => ({
        ...article,
        likeCount: Array.isArray(article.likes)
          ? article.likes[0]?.count || 0
          : article.likes || 0
      }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5)

    return NextResponse.json({ articles: sortedArticles })
  } catch (error) {
    console.error('Server error:', error)
    const mockTopArticles = [
      {
        id: 5,
        title: "Career Development Resources",
        content: "Planning for your future career starts now. Take advantage of career counseling services, internship opportunities, and networking events...",
        author_id: "demo-user",
        created_at: new Date(Date.now() - 345600000).toISOString(),
        profiles: { email: "career@portal.com" },
        likeCount: 20
      },
      {
        id: 4,
        title: "Time Management for Students",
        content: "Balancing coursework, extracurricular activities, and personal life can be challenging. Learn to prioritize tasks...",
        author_id: "demo-user",
        created_at: new Date(Date.now() - 259200000).toISOString(),
        profiles: { email: "advisor@portal.com" },
        likeCount: 15
      },
      {
        id: 3,
        title: "Campus Events This Semester",
        content: "Don't miss out on exciting events happening around campus! From guest lectures to cultural festivals...",
        author_id: "demo-user",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        profiles: { email: "events@portal.com" },
        likeCount: 12
      },
      {
        id: 2,
        title: "Study Tips for Better Grades",
        content: "Effective study habits can make a significant difference in your academic performance...",
        author_id: "demo-user",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { email: "student@portal.com" },
        likeCount: 8
      },
      {
        id: 1,
        title: "Welcome to Our Student Portal",
        content: "This is your gateway to academic success. Here you'll find resources, articles, and tools...",
        author_id: "demo-user",
        created_at: new Date().toISOString(),
        profiles: { email: "admin@portal.com" },
        likeCount: 5
      }
    ]

    return NextResponse.json({ articles: mockTopArticles })
  }
}
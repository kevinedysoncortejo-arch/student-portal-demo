// app/api/admin/notifications/route.ts
import { createSupabaseServerClient } from '@/library/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request)
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { subject, message } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Get all users except admins
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .neq('role', 'admin')

    if (users && users.length > 0) {
      const notifications = users.map(userProfile => ({
        type: 'admin_message',
        message: `${subject}: ${message}`,
        user_id: userProfile.id
      }))

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select()
        .single()

      if (error) {
        console.error('Error creating notifications:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(`Notification sent to ${users.length} users: ${subject} - ${message}`)

      return NextResponse.json({ notification, recipientCount: users.length })
    } else {
      return NextResponse.json({ message: 'No users to notify' })
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
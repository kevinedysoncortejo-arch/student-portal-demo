// app/admin/dashboard/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Send, Mail } from 'lucide-react'
import { getAuthHeaders } from '@/library/supabase/client'

interface Notification {
  id: number
  type: string
  message: string
  created_at: string
  recipient_count: number
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showSendForm, setShowSendForm] = useState(false)
  const [formData, setFormData] = useState({ subject: '', message: '' })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/notifications', { headers })
      const data = await response.json()
      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev])
        setShowSendForm(false)
        setFormData({ subject: '', message: '' })
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={() => setShowSendForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Send Notification Form */}
      {showSendForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Send New Notification</h2>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg h-32 resize-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Send to All Users
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSendForm(false)
                  setFormData({ subject: '', message: '' })
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Notification History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No notifications sent yet.</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notification.type}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      Sent {new Date(notification.created_at).toLocaleDateString()} •
                      {notification.recipient_count} recipients
                    </div>
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
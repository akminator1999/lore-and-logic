'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications'

interface Notification {
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  created_at: Date
}

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch unread count on mount and periodically
  useEffect(() => {
    const fetchCount = async () => {
      const c = await getUnreadCount()
      setCount(c)
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000) // every 30s
    return () => clearInterval(interval)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      getNotifications().then(setNotifications)
    }
  }, [open])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
      setCount(c => Math.max(0, c - 1))
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    }
    setOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const handleMarkAll = async () => {
    await markAllAsRead()
    setCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-300 hover:text-white transition p-1"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 max-w-[90vw] bg-[#131a2c] border border-gray-700 rounded-xl shadow-2xl z-50 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-300">Notifications</h3>
            {notifications.some(n => !n.read) && (
              <button onClick={handleMarkAll} className="text-xs text-purple-400 hover:text-purple-300">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No notifications yet.</p>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {notifications.map(n => (
                <li key={n.id}>
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                      n.read ? 'bg-gray-800 text-gray-400' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <p>{n.message}</p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
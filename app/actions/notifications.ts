'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })
  if (!customUser) return 0

  return await prisma.notification.count({
    where: { user_id: customUser.id, read: false },
  })
}

export async function getNotifications(): Promise<{
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  created_at: Date
}[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })
  if (!customUser) return []

  return await prisma.notification.findMany({
    where: { user_id: customUser.id },
    orderBy: { created_at: 'desc' },
    take: 10,
    select: {
      id: true,
      type: true,
      message: true,
      link: true,
      read: true,
      created_at: true,
    },
  })
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })
  if (!customUser) return

  await prisma.notification.updateMany({
    where: { id: notificationId, user_id: customUser.id },
    data: { read: true },
  })
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })
  if (!customUser) return

  await prisma.notification.updateMany({
    where: { user_id: customUser.id, read: false },
    data: { read: true },
  })
}
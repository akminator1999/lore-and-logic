'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleBookmark(articleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Find the custom user id from your User table
  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })

  if (!customUser) throw new Error('Profile not found')

  // Check if bookmark already exists
  const existing = await prisma.bookmark.findUnique({
    where: {
      user_id_article_id: {
        user_id: customUser.id,
        article_id: articleId,
      },
    },
  })

  if (existing) {
    // Remove bookmark
    await prisma.bookmark.delete({
      where: {
        user_id_article_id: {
          user_id: customUser.id,
          article_id: articleId,
        },
      },
    })
  } else {
    // Add bookmark
    await prisma.bookmark.create({
      data: {
        user_id: customUser.id,
        article_id: articleId,
      },
    })
  }

  revalidatePath('/articles/[slug]', 'page')
  revalidatePath('/bookmarks')
}
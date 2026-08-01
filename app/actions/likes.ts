'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Helper to get current user's custom ID
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const cu = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } })
  return cu?.id ?? null
}

// Toggle article like/dislike
export async function toggleArticleLike(articleId: string, action: 'like' | 'dislike') {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  // Remove existing record if any
  await prisma.articleLike.deleteMany({
    where: { user_id: userId, article_id: articleId },
  })

  // If the action is not the same as the previous (or it's a new click), we add the new one
  // Since we deleted, just add the new type
  await prisma.articleLike.create({
    data: {
      user_id: userId,
      article_id: articleId,
      type: action,
    },
  })

  revalidatePath(`/articles/[slug]`, 'page')
}

// Remove article like/dislike (clicking the same active button)
export async function removeArticleLike(articleId: string) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  await prisma.articleLike.deleteMany({
    where: { user_id: userId, article_id: articleId },
  })
  revalidatePath(`/articles/[slug]`, 'page')
}

// Get article like/dislike counts and user's current vote
export async function getArticleLikeInfo(articleId: string) {
  const userId = await getCurrentUserId()

  const [likes, dislikes, userVote] = await Promise.all([
    prisma.articleLike.count({ where: { article_id: articleId, type: 'like' } }),
    prisma.articleLike.count({ where: { article_id: articleId, type: 'dislike' } }),
    userId
      ? prisma.articleLike.findUnique({
          where: {
            user_id_article_id: { user_id: userId, article_id: articleId },
          },
          select: { type: true },
        })
      : null,
  ])

  return { likes, dislikes, userVote: userVote?.type || null }
}

// Toggle comment like/dislike
export async function toggleCommentLike(commentId: string, action: 'like' | 'dislike') {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  await prisma.commentLike.deleteMany({
    where: { user_id: userId, comment_id: commentId },
  })

  await prisma.commentLike.create({
    data: {
      user_id: userId,
      comment_id: commentId,
      type: action,
    },
  })

  revalidatePath(`/articles/[slug]`, 'page')
}

// Remove comment like/dislike
export async function removeCommentLike(commentId: string) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  await prisma.commentLike.deleteMany({
    where: { user_id: userId, comment_id: commentId },
  })
  revalidatePath(`/articles/[slug]`, 'page')
}

// Get comment likes/dislikes and user vote (for multiple comments, we can batch)
export async function getCommentLikeInfo(commentId: string) {
  const userId = await getCurrentUserId()

  const [likes, dislikes, userVote] = await Promise.all([
    prisma.commentLike.count({ where: { comment_id: commentId, type: 'like' } }),
    prisma.commentLike.count({ where: { comment_id: commentId, type: 'dislike' } }),
    userId
      ? prisma.commentLike.findUnique({
          where: {
            user_id_comment_id: { user_id: userId, comment_id: commentId },
          },
          select: { type: true },
        })
      : null,
  ])

  return { likes, dislikes, userVote: userVote?.type || null }
}
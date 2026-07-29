'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get current user's custom ID (helper)
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })
  return customUser?.id ?? null
}

// Toggle follow and return new state
export async function toggleFollow(followingId: string): Promise<{ isFollowing: boolean }> {
  const followerId = await getCurrentUserId()
  if (!followerId) throw new Error('Not authenticated')
  if (followerId === followingId) throw new Error('Cannot follow yourself')

  const existing = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId,
      },
    },
  })

  if (existing) {
    // Unfollow
    await prisma.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    })
    revalidatePath(`/profile/[username]`, 'page')
    return { isFollowing: false }
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    })

    // Create notification for the followed user
    const followedUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { username: true },
    })
    const followerUser = await prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true },
    })
    if (followedUser && followerUser) {
      await prisma.notification.create({
        data: {
          user_id: followingId,
          type: 'follow',
          message: `${followerUser.username} started following you.`,
          link: `/profile/${followerUser.username}`,
        },
      })
    }

    revalidatePath(`/profile/[username]`, 'page')
    return { isFollowing: true }
  }
}

// Get follow state for a specific profile
export async function getFollowState(followingId: string): Promise<boolean> {
  const followerId = await getCurrentUserId()
  if (!followerId) return false

  const follow = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId,
      },
    },
  })
  return !!follow
}

// Get followers/following counts for a user
export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { following_id: userId } }),
    prisma.follow.count({ where: { follower_id: userId } }),
  ])
  return { followers, following }
}
'use client'

import { useState, useTransition } from 'react'
import { toggleCommentLike, removeCommentLike } from '@/app/actions/likes'

export default function CommentLikeDislike({
  commentId,
  initialLikes,
  initialDislikes,
  initialUserVote,
}: {
  commentId: string
  initialLikes: number
  initialDislikes: number
  initialUserVote: string | null
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userVote, setUserVote] = useState<string | null>(initialUserVote)
  const [isPending, startTransition] = useTransition()

  const handleVote = (action: 'like' | 'dislike') => {
    if (isPending) return
    startTransition(async () => {
      if (userVote === action) {
        await removeCommentLike(commentId)
        setUserVote(null)
        if (action === 'like') setLikes(likes - 1)
        else setDislikes(dislikes - 1)
      } else {
        if (userVote) {
          if (userVote === 'like') setLikes(likes - 1)
          else setDislikes(dislikes - 1)
        }
        await toggleCommentLike(commentId, action)
        setUserVote(action)
        if (action === 'like') setLikes(likes + 1)
        else setDislikes(dislikes + 1)
      }
    })
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
      <button
        onClick={() => handleVote('like')}
        disabled={isPending}
        className={`flex items-center gap-1 hover:text-purple-400 transition ${
          userVote === 'like' ? 'text-purple-400' : ''
        }`}
      >
        <svg className="w-4 h-4" fill={userVote === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{likes}</span>
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={isPending}
        className={`flex items-center gap-1 hover:text-red-400 transition ${
          userVote === 'dislike' ? 'text-red-400' : ''
        }`}
      >
        <svg className="w-4 h-4 transform rotate-180" fill={userVote === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
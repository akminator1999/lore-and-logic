'use client'

import { useState, useTransition } from 'react'
import { toggleArticleLike, removeArticleLike } from '@/app/actions/likes'
import { useRouter} from 'next/navigation'

export default function ArticleLikeDislike({
  articleId,
  initialLikes,
  initialDislikes,
  initialUserVote,
  isLoggedIn,
}: {
  articleId: string
  initialLikes: number
  initialDislikes: number
  initialUserVote: string | null
  isLoggedIn: boolean
}) {
    const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userVote, setUserVote] = useState<string | null>(initialUserVote)
  const [isPending, startTransition] = useTransition()

  const handleVote = (action: 'like' | 'dislike') => {
    if(!isLoggedIn) {
        router.push('/login')
        return 
    }

    if (isPending) return
    startTransition(async () => {
      if (userVote === action) {
        // Clicked the same active button -> remove vote
        await removeArticleLike(articleId)
        setUserVote(null)
        if (action === 'like') setLikes(likes - 1)
        else setDislikes(dislikes - 1)
      } else {
        // New vote or switch
        if (userVote) {
          // Undo old vote
          if (userVote === 'like') setLikes(likes - 1)
          else setDislikes(dislikes - 1)
        }
        await toggleArticleLike(articleId, action)
        setUserVote(action)
        if (action === 'like') setLikes(likes + 1)
        else setDislikes(dislikes + 1)
      }
    })
  }

  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <button
        onClick={() => handleVote('like')}
        disabled={isPending}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-700 transition ${
          userVote === 'like' ? 'text-purple-400 bg-purple-900/20' : ''
        }`}
        title="Like"
      >
        <svg className="w-5 h-5" fill={userVote === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{likes}</span>
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={isPending}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-700 transition ${
          userVote === 'dislike' ? 'text-red-400 bg-red-900/20' : ''
        }`}
        title="Dislike"
      >
        <svg className="w-5 h-5 transform rotate-180" fill={userVote === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
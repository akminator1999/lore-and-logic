'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/app/actions/bookmark'

export default function BookmarkButton({
  articleId,
  initialBookmarked,
}: {
  articleId: string
  initialBookmarked: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await toggleBookmark(articleId)
      setBookmarked(!bookmarked)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-2xl transition-transform hover:scale-110 ${
        bookmarked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Save for later'}
    >
    
    {bookmarked ? (
    <svg className="w-5 h-5 text-purple-400" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
    ) : (
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    )}

    </button>
  )
}
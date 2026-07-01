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
      {bookmarked ? '❤️' : '🤍'}
    </button>
  )
}
'use client'

import { useState } from 'react'
import CommentForm from './CommentForm'

export default function ReplyToggle({
  articleId,
  parentId,
  isLoggedIn,
}: {
  articleId: string
  parentId: string
  isLoggedIn: boolean
}) {
  const [showForm, setShowForm] = useState(false)

  if(!isLoggedIn) return null // Don't show reply button for guest

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-purple-400 hover:text-purple-300 mt-2"
        >
          Reply
        </button>
      )}
      {showForm && (
        <div className="mt-2">
          <CommentForm
            articleId={articleId}
            parentId={parentId}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import CommentForm from './CommentForm'

export default function ReplyToggle({
  articleId,
  parentId,
}: {
  articleId: string
  parentId: string
}) {
  const [showForm, setShowForm] = useState(false)

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
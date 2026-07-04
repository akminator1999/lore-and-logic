'use client'

import { useState, useTransition } from 'react'
import { editComment, deleteComment } from '@/app/actions/comment'

export default function CommentActions({
  commentId,
  initialBody,
  currentUserId,
}: {
  commentId: string
  initialBody: string
  currentUserId: string | null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [body, setBody] = useState(initialBody)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!body.trim()) return
    startTransition(async () => {
      await editComment(commentId, body)
      setIsEditing(false)
    })
  }

  const handleDelete = () => {
    if (!confirm('Delete this comment? Replies will also be removed.')) return
    startTransition(async () => {
      await deleteComment(commentId)
    })
  }

  if (isEditing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm resize-y"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending || !body.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs px-3 py-1 rounded"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setBody(initialBody)
            }}
            className="text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-gray-400 hover:text-purple-300"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-gray-400 hover:text-red-400"
      >
        Delete
      </button>
    </div>
  )
}
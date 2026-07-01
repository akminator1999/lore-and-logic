'use client'

import { useState, useRef } from 'react'
import { addComment } from '@/app/actions/comment'

export default function CommentForm({
  articleId,
  parentId,
  onSuccess,
}: {
  articleId: string
  parentId?: string
  onSuccess?: () => void
}) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setIsSubmitting(true)
    try {
      await addComment(articleId, body, parentId)
      setBody('')
      formRef.current?.reset()
      onSuccess?.()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      <textarea
        placeholder={parentId ? 'Write a reply…' : 'Join the discussion…'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        required
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm resize-y"
      />
      <div className="flex justify-end gap-2">
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm px-4 py-1 rounded-lg transition"
        >
          {isSubmitting ? 'Posting…' : parentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  )
}
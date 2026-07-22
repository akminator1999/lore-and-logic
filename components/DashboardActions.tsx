'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { togglePublish, deleteArticle } from '@/app/actions/dashboard'
import Link from 'next/link'

export default function DashboardActions({
  articleId,
  slug,
  isPublished,
}: {
  articleId: string
  slug: string
  isPublished: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = () => {
    startTransition(async () => {
      await togglePublish(articleId)
    })
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return
    startTransition(async () => {
      await deleteArticle(articleId)
      router.refresh() // force refresh after delete
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/articles/${slug}`}
        className="text-xs text-purple-400 hover:text-purple-300 transition"
      >
        View
      </Link>
      <Link
        href={`/articles/${slug}/edit`} 
        className="text-xs text-amber-400 hover:text-amber-300 transition" 
      >
        Edit
      </Link>
        
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="text-xs text-cyan-400 hover:text-cyan-300 transition"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-red-300 transition"
      >
        Delete
      </button>
    </div>
  )
}
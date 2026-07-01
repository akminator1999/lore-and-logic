import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ReplyToggle from './ReplyToggle'

// 1. Explicitly describe the shape of a comment with its author
interface CommentWithUser {
  id: string
  body: string
  created_at: Date
  updated_at: Date
  author_id: string
  article_id: string
  parent_id: string | null
  User: {
    username: string
    badge: string
  }
}

// 2. Tree node extends that shape with children
interface CommentTree extends CommentWithUser {
  children: CommentTree[]
}

async function getComments(articleId: string): Promise<CommentTree[]> {
  const comments = await prisma.comment.findMany({
    where: { article_id: articleId },
    orderBy: { created_at: 'asc' },
    include: {
      User: { select: { username: true, badge: true } },
    },
  })

  // 3. Build the tree using our explicit type
  const map = new Map<string, CommentTree>()
  const roots: CommentTree[] = []

  // Cast each comment to CommentWithUser (it already has User from include)
  comments.forEach((c) => {
    const node: CommentTree = {
      ...c,
      User: c.User,               // TypeScript now knows User exists
      children: [],
    }
    map.set(c.id, node)
  })

  comments.forEach((c) => {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// Recursive comment component
function CommentNode({
  comment,
  articleId,
  depth = 0,
}: {
  comment: CommentTree
  articleId: string
  depth?: number
}) {
  return (
    <div
      className={`${
        depth > 0 ? 'ml-6 border-l-2 border-gray-700 pl-4' : ''
      } mt-4`}
    >
      <div className="bg-[#131a2c] rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm mb-2">
          <Link
            href={`/profile/${comment.User.username}`}
            className="font-semibold hover:text-purple-300 transition"
          >
            {comment.User.username}
          </Link>
          <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded uppercase">
            {comment.User.badge}
          </span>
          <span className="text-gray-500 text-xs">
            {new Date(comment.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <p className="text-gray-200 text-sm whitespace-pre-wrap">
          {comment.body}
        </p>
        <ReplyToggle articleId={articleId} parentId={comment.id} />
      </div>

      {comment.children.map((child) => (
        <CommentNode
          key={child.id}
          comment={child}
          articleId={articleId}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

export default async function CommentList({
  articleId,
}: {
  articleId: string
}) {
  const roots = await getComments(articleId)

  if (roots.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic py-4">
        No comments yet. Be the first to share your thoughts.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {roots.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          articleId={articleId}
        />
      ))}
    </div>
  )
}
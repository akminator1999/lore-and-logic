import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardActions from '@/components/DashboardActions'

// Helper to get stats for the author
async function getStats(authorId: string) {
  const [articleCount, totalViews, totalBookmarks, totalComments] = await Promise.all([
    prisma.article.count({ where: { author_id: authorId } }),
    prisma.article.aggregate({
      where: { author_id: authorId },
      _sum: { view_count: true },
    }),
    prisma.bookmark.count({
      where: { Article: { author_id: authorId } },
    }),
    prisma.comment.count({
      where: { Article: { author_id: authorId } },
    }),
  ])

  return {
    articles: articleCount,
    views: totalViews._sum.view_count ?? 0,
    bookmarks: totalBookmarks,
    comments: totalComments,
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, badge: true, username: true },
  })

  if (!customUser || customUser.badge !== 'Creator') {
    redirect('/access-denied')
  }

  // Read filters from URL
  const { search, type, status } = await searchParams

  // Build Prisma where clause
  const where: any = { author_id: customUser.id }
  if (search) {
    where.title = { contains: search, mode: 'insensitive' }
  }
  if (type && (type === 'deep_dive' || type === 'pulse')) {
    where.type = type
  }
  if (status === 'published') {
    where.is_published = true
  } else if (status === 'unpublished') {
    where.is_published = false
  }

  // Fetch articles with counts
  const articles = await prisma.article.findMany({
    where,
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      is_published: true,
      published_at: true,
      created_at: true,
      _count: {
        select: {
          Bookmark: true,
          Comment: true,
        },
      },
      view_count: true,
    },
  })

  // Get overall stats
  const stats = await getStats(customUser.id)

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold">Dashboard</h1>
          <Link
            href="/write"
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full font-semibold transition"
          >
            + New Article
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#131a2c] p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Articles</p>
            <p className="text-2xl font-bold">{stats.articles}</p>
          </div>
          <div className="bg-[#131a2c] p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Total Views</p>
            <p className="text-2xl font-bold">{stats.views}</p>
          </div>
          <div className="bg-[#131a2c] p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Bookmarks</p>
            <p className="text-2xl font-bold">{stats.bookmarks}</p>
          </div>
          <div className="bg-[#131a2c] p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Comments</p>
            <p className="text-2xl font-bold">{stats.comments}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <form method="GET" className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search articles..."
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 flex-1 min-w-[200px]"
          />
          <select
            name="type"
            defaultValue={type || ''}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="">All Types</option>
            <option value="deep_dive">Deep Dive</option>
            <option value="pulse">Pulse</option>
          </select>
          <select
            name="status"
            defaultValue={status || ''}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Apply
          </button>
          {(search || type || status) && (
            <Link
              href="/dashboard"
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Table */}
        {articles.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>No articles match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 text-sm uppercase">
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2 hidden md:table-cell">Type</th>
                  <th className="px-4 py-2 hidden md:table-cell">Status</th>
                  <th className="px-4 py-2 hidden sm:table-cell">Views</th>
                  <th className="px-4 py-2 hidden sm:table-cell">Bookmarks</th>
                  <th className="px-4 py-2 hidden sm:table-cell">Comments</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="bg-[#131a2c] rounded-lg">
                    <td className="px-4 py-3 font-medium">
                      <div className="max-w-[250px] truncate">{article.title}</div>
                      <div className="text-xs text-gray-500 mt-1">/{article.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full uppercase ${
                          article.type === 'deep_dive'
                            ? 'bg-cyan-900/50 text-cyan-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {article.type === 'deep_dive' ? 'Deep Dive' : 'Pulse'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          article.is_published
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {article.is_published ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-sm">
                      {article.view_count}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-sm">
                      {article._count.Bookmark}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-sm">
                      {article._count.Comment}
                    </td>
                    <td className="px-4 py-3">
                      <DashboardActions
                        articleId={article.id}
                        slug={article.slug}
                        isPublished={article.is_published}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
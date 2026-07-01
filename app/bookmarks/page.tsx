import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, username: true },
  })

  if (!customUser) redirect('/login')

  const bookmarks = await prisma.bookmark.findMany({
    where: { user_id: customUser.id },
    include: {
      Article: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          type: true,
          cover_image_url: true,
          User: { select: { username: true, badge: true } },
          ArticleTag: { select: { Tag: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-2">Your Bookmarks</h1>
        <p className="text-gray-400 mb-8">
          Articles you’ve saved for later.
        </p>

        {bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No bookmarks yet.</p>
            <Link href="/" className="text-purple-400 hover:underline mt-2 inline-block">
              Explore deep dives and news
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(({ Article: article }) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-[#131a2c] rounded-xl overflow-hidden shadow-lg hover:ring-2 ring-purple-500/50 transition flex flex-col"
              >
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.ArticleTag.map((at) => (
                        <span
                          key={at.Tag.id}
                          className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full uppercase"
                        >
                          {at.Tag.name}
                        </span>
                      ))}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                          article.type === 'deep_dive'
                            ? 'bg-cyan-900/50 text-cyan-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {article.type === 'deep_dive' ? 'Deep Dive' : 'News'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold leading-snug">{article.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                    <span>{article.User.username}</span>
                    <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase">
                      {article.User.badge}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
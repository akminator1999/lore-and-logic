import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getPulseArticles() {
  return await prisma.article.findMany({
    where: {
      type: 'pulse',
      is_published: true,
    },
    orderBy: { published_at: 'desc' },
    take: 20,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      cover_image_url: true,
      User: { select: { username: true, badge: true } },
      ArticleTag: { select: { Tag: { select: { id: true, name: true } } } },
    },
  })
}

export default async function PulsePage() {
  const articles = await getPulseArticles()

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-2">Pulse</h1>
        <p className="text-gray-400 mb-8">
          The latest news on upcoming games, engines, hardware, and indie gems.
        </p>

        {articles.length === 0 ? (
          <p className="text-gray-500 italic">No pulse articles published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-[#131a2c] rounded-xl shadow-lg hover:ring-2 ring-cyan-500/50 transition overflow-hidden flex flex-col"
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
                      <span className="bg-cyan-900/50 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full uppercase">
                        News
                      </span>
                    </div>
                    <h2 className="text-lg font-bold mb-1">{article.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
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
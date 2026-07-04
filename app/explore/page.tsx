import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Helper to fetch articles by era
async function getArticlesByEra(era: string | undefined) {
  if (!era || era === 'All') {
    // Show all published articles (both deep dives and pulse)
    return await prisma.article.findMany({
      where: { is_published: true },
      orderBy: { published_at: 'desc' },
      take: 30,
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
    })
  }

  // Filter by era through linked games
  return await prisma.article.findMany({
    where: {
      is_published: true,
      ArticleGameLink: {
        some: {
          GamePage: {
            era: {
              equals: era,
              mode: 'insensitive',
            },
          },
        },
      },
    },
    orderBy: { published_at: 'desc' },
    take: 30,
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
  })
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ era?: string }>
}) {
  const { era } = await searchParams
  const articles = await getArticlesByEra(era)

  const eraPills = ['All', '8-bit', '16-bit', 'Early 3D', 'PS2/Xbox', 'Modern Indie', 'VR']
  const pageTitle = era && era !== 'All' ? `Explore: ${era}` : 'Explore All Eras'

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-2">{pageTitle}</h1>
        <p className="text-gray-400 mb-6">Discover games and deep dives from every generation.</p>

        {/* Era Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {eraPills.map((pill) => (
            <Link
              key={pill}
              href={`/explore?era=${encodeURIComponent(pill)}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                era === pill || (!era && pill === 'All')
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {pill}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No articles found for this era yet.</p>
            <p className="text-gray-600 mt-2">Be the first to explore it — or try another era.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-[#131a2c] rounded-xl shadow-lg hover:ring-2 ring-purple-500/50 transition overflow-hidden flex flex-col"
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
                    <h2 className="text-lg font-bold mb-1 leading-snug">{article.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-3">{article.excerpt}</p>
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
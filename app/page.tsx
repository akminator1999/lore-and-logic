import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Fetch the latest published deep dive for the "Featured" card
async function getFeaturedDeepDive() {
  return await prisma.article.findFirst({
    where: {
      type: 'deep_dive',
      is_published: true,
    },
    orderBy: { published_at: 'desc' },
    include: {
      User: { select: { username: true, badge: true } },
      ArticleTag: { include: { Tag: true } },
      ArticleGameLink: { include: { GamePage: true } },
    },
  })
}

// Fetch the latest published pulse articles
async function getLatestPulse(count: number) {
  return await prisma.article.findMany({
    where: {
      type: 'pulse',
      is_published: true,
    },
    orderBy: { published_at: 'desc' },
    take: count,
    include: {
      User: { select: { username: true, badge: true } },
      ArticleTag: { include: { Tag: true } },
    },
  })
}

export default async function HomePage() {
  const featured = await getFeaturedDeepDive()
  const pulseArticles = await getLatestPulse(3)

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Explore how games are made <br />
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            from the pixel to the story
          </span>
          {' '}across every era.
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          The first community where gamers and developers connect as equals — diving deep into game
          history, sharing behind‑the‑scenes craft, and fueling each other’s passion.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/deep-dives"
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition"
          >
            Browse Deep Dives
          </Link>
          <Link
            href="/pulse"
            className="border border-cyan-400 text-cyan-400 px-6 py-3 rounded-full font-semibold hover:bg-cyan-400/10 transition"
          >
            Latest Pulse News
          </Link>
        </div>
      </section>

      {/* Featured Deep Dive */}
      {featured && (
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-purple-300">Featured Deep Dive</h2>
          <Link href={`/articles/${featured.slug}`} className="block group">
            <div className="bg-[#131a2c] rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:ring-2 ring-purple-500/50 transition">
              {featured.cover_image_url && (
                <div className="md:w-2/5 h-48 md:h-auto">
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col justify-center flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {featured.ArticleTag.map((at) => (
                    <span
                      key={at.Tag.id}
                      className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full uppercase"
                    >
                      {at.Tag.name}
                    </span>
                  ))}
                  <span className="bg-cyan-900/50 text-cyan-300 text-xs px-2 py-1 rounded-full uppercase">
                    Deep Dive
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-300 transition">
                  {featured.title}
                </h3>
                <p className="text-gray-400 mb-3">{featured.excerpt}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{featured.User.username}</span>
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs uppercase font-semibold">
                    {featured.User.badge}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Latest Pulse News */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-cyan-300">Latest Pulse News</h2>
        {pulseArticles.length === 0 ? (
          <p className="text-gray-400 italic">No news yet — check back soon for updates on upcoming games, engines, and hardware.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pulseArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-[#131a2c] rounded-xl p-5 shadow-lg hover:ring-2 ring-cyan-500/50 transition block"
              >
              
                {/*New: Cover Image*/}
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-lg shadow-lg mb-3"
                  />
                )}
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
                <h3 className="font-bold text-lg mb-1">{article.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">{article.excerpt}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>{article.User.username}</span>
                  <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase">
                    {article.User.badge}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Explore by Era */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-center">Explore by Era</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {['All', '8-bit', '16-bit', 'Early 3D', 'PS2/Xbox','PS3/Xbox 360','PS4/Xbox One','Modern AAA', 'Modern Indie', 'VR'].map((era) => (
            <Link
              key={era}
              href={`/explore?era=${encodeURIComponent(era)}`}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-full text-sm font-medium transition"
            >
              {era}
            </Link>
          ))}
        </div>
      </section>

      {/* Join the Community */}
      <section className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-3">Join the Community</h2>
          <p className="text-gray-300 mb-6">
            Are you a gamer or a developer? Create your profile and connect with a community that
            loves the craft and the story.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup?role=gamer"
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full font-semibold transition"
            >
              Sign Up as Gamer
            </Link>
            <Link
              href="/signup?role=developer"
              className="border border-cyan-400 text-cyan-400 px-6 py-3 rounded-full font-semibold hover:bg-cyan-400/10 transition"
            >
              Sign Up as Developer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Lore &amp; Logic. All rights reserved.</p>
      </footer>
    </div>
  )
}
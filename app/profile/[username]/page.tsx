import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getUserProfile(username: string) {
  return await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true, // careful: only show if you want; we'll omit it for privacy,but we need to check if the currently logged-in user is viewing their own profile.
      avatar_url: true,
      role: true,
      bio: true,
      badge: true,
      favorite_genres: true,
      dev_role: true,
      games_worked_on: true,
      portfolio_links: true,
      created_at: true,
      Article: {
        where: { is_published: true },
        orderBy: { published_at: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          excerpt: true,
          cover_image_url: true,
          ArticleTag: { select: { Tag: { select: { id: true, name: true } } } },
        },
      },
    },
  })
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) notFound()   // ← must be before accessing profile.email

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()   // ← add 'await' here
  const isOwner = user?.email === profile.email

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{profile.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs uppercase font-semibold">
                {profile.badge}
              </span>
              {isOwner && (
                <Link
                  href="/profile/edit"
                  className="ml-3 text-sm text-amber-400 hover:text-amber-300"
                >
                  ✏️ Edit Profile
                </Link>
              )}
              <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs uppercase">
                {profile.role === 'developer' ? '🔧 Developer' : '🎮 Gamer'}
              </span>
            </div>
            {profile.bio && (
              <p className="text-gray-400 mt-3">{profile.bio}</p>
            )}
            {profile.favorite_genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {profile.favorite_genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-purple-900/50 text-purple-300 text-xs px-2 py-0.5 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            {profile.dev_role && (
              <p className="text-gray-400 text-sm mt-2">
                Developer role: {profile.dev_role}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Joined{' '}
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>

        {/* Authored Articles */}
        <h2 className="text-2xl font-bold mb-4">Articles</h2>
        {profile.Article.length === 0 ? (
          <p className="text-gray-500 italic">No published articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.Article.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-[#131a2c] rounded-xl overflow-hidden shadow-lg hover:ring-2 ring-purple-500/50 transition flex flex-col"
              >
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1">
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
                    <h3 className="font-bold leading-snug">{article.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                      {article.excerpt}
                    </p>
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
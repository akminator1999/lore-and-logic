import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookmarkButton from '@/components/BookmarkButtom'
import CommentList from '@/components/CommentList'
import CommentForm from '@/components/CommentForm'

async function getArticle(slug: string) {
  return await prisma.article.findUnique({
    where: { slug },
    include: {
      User: {
        select: { username: true, badge: true, avatar_url: true, dev_role: true },
      },
      ArticleTag: {
        include: { Tag: true },
      },
      ArticleGameLink: {
        include: { GamePage: true },
      },
    },
  })
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) notFound()

  const tags = article.ArticleTag.map((at) => at.Tag)
  const games = article.ArticleGameLink.map((lg) => lg.GamePage)
  
  //fetch the session and bookmark status
  //fetch the current user id to pass to CommentList and CommentActions
  const supabase = await createClient()
  const { data: {user } } = await supabase.auth.getUser()

  let isBookmarked = false
  let currentUserId: string | null = null
  if (user) {
    const customUser = await prisma.user.findUnique({
      where: { email: user.email!},
      select: {id:true},
    })
    if(customUser) {
      currentUserId = customUser.id
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          user_id_article_id: {
            user_id: customUser.id,
            article_id: article.id,
          },
        },
      })
      isBookmarked = !!bookmark
    }
  }
  
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-purple-900/50 text-purple-300 text-xs px-3 py-1 rounded-full uppercase"
            >
              {tag.name}
            </span>
          ))}
          <span className="bg-cyan-900/50 text-cyan-300 text-xs px-3 py-1 rounded-full uppercase">
            {article.type === 'deep_dive' ? 'Deep Dive' : 'News'}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          {article.title}
        </h1>
        
        {/* Bookmark button, looks bad but works for some time */}
        {user && ( 
          <div className="mt-2">
            <BookmarkButton articleId = { article.id} initialBookmarked={isBookmarked} />
            </div>
        )}

        <div className="flex items-center gap-3 text-gray-400 text-sm mb-6">
         
          <Link href={`/profile/${article.User.username}`} className="flex items-center gap-1 hover:text-white transition" >
              <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
              {article.User.username[0].toUpperCase()}
              </span>
              {article.User.username}
          </Link>
         
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs uppercase font-semibold">
            {article.User.badge}
          </span>
          {article.published_at && (
            <time dateTime={new Date(article.published_at).toISOString()}>
              {new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>
      </div>
      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
            <img
                src={article.cover_image_url}
                alt={article.title}
                className="max-w-full h-80 md:h-[32rem] object-cover rounded-xl shadow-lg"
            />
        </div>
      )}

      {/* Two‑column layout */}
      <div className="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content – switches between Deep Dive and Pulse */}
        <div className="md:col-span-2 space-y-10">
          {article.type === 'deep_dive' ? (
            <>
              {article.intro_gamer && (
                <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300">
                  <span className="text-purple-400 font-semibold text-sm uppercase tracking-wider">
                    🎮 For the Player
                  </span>
                  <p className="mt-2">{article.intro_gamer}</p>
                </blockquote>
              )}
              {article.intro_dev && (
                <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-300">
                  <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                    🔧 For the Creator
                  </span>
                  <p className="mt-2">{article.intro_dev}</p>
                </blockquote>
              )}
              {article.pixel_section && (
                <section className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-purple-300">
                    ⚙️ The Pixel: The Craft
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: article.pixel_section }} />
                </section>
              )}
              {article.story_section && (
                <section className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-cyan-300">
                    📖 The Story: The Impact
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: article.story_section }} />
                </section>
              )}
              {article.connecting_thread && (
                <section className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-purple-200">
                    🔗 The Connecting Thread
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: article.connecting_thread }} />
                </section>
              )}
              {article.open_question && (
                <blockquote className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                  <p className="text-amber-300 font-semibold mb-1">
                    💬 Community Question
                  </p>
                  <p className="text-gray-200 italic">{article.open_question}</p>
                </blockquote>
              )}
            </>
          ) : (
            /* Pulse News */
            <>
              {article.news_hook && (
                <div className="prose prose-invert max-w-none">
                  <p className="lead text-lg text-gray-200">{article.news_hook}</p>
                </div>
              )}
              {article.gamer_angle && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-blue-400 font-semibold text-lg mb-2">🎮 For Gamers</h3>
                  <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: article.gamer_angle }} />
                </div>
              )}
              {article.dev_angle && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-purple-400 font-semibold text-lg mb-2">🔧 For Developers</h3>
                  <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: article.dev_angle }} />
                </div>
              )}
              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-cyan-400 hover:text-cyan-300 underline text-sm"
                >
                  Source &rarr;
                </a>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden md:block space-y-6">
          {/* Author Card */}
          <div className="bg-[#131a2c] p-5 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                {article.User.username[0].toUpperCase()}
              </div>
              <div>
                <Link
                    href={`/profile/${article.User.username}`}
                    className="hover:text-white transition"
                >
                    {article.User.username}
                </Link>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase">
                  {article.User.badge}
                </span>
              </div>
            </div>
            {article.User.dev_role && (
              <p className="text-sm text-gray-400">{article.User.dev_role}</p>
            )}
          </div>

          {/* Linked Games */}
          {games.length > 0 && (
            <div className="bg-[#131a2c] p-5 rounded-xl shadow-lg">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                Linked Games
              </h4>
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex justify-between py-2 border-b border-gray-800 last:border-0"
                >
                  <span className="text-white text-sm">{game.title}</span>
                  <span className="text-gray-500 text-xs">{game.release_year}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Facts */}
          {games[0] && (
            <div className="bg-[#131a2c] p-5 rounded-xl shadow-lg">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                Quick Facts
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <span className="text-gray-500">Platforms:</span>{' '}
                  {games[0].platform.join(', ')}
                </li>
                <li>
                  <span className="text-gray-500">Developer:</span>{' '}
                  {games[0].developer}
                </li>
                <li>
                  <span className="text-gray-500">Era:</span>{' '}
                  {games[0].era}
                </li>
                <li>
                  <span className="text-gray-500">Primary Tech:</span>{' '}
                  {games[0].primary_tech_tags.join(', ')}
                </li>
              </ul>
            </div>
          )}
        </aside>
      </div>
      {/* Comments Section */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
           <hr className="border-gray-800 mb-8" />
           <h2 className="text-2xl font-bold mb-6">💬 Comments</h2>

        {/* Check if user is logged in to show the top-level form */}
        {/* To show a message like "Log in to comment", let me pass a prop from the page.
      The page already has `user` from the Supabase session.*/}
            {user ? (
            <div className="mb-8">
              <CommentForm articleId={article.id} />
            </div>
          ) : (
            <div className="mb-8 text-gray-400 text-sm">
              <Link href="/login" className="text-purple-400 hover:underline">Log in</Link> to join the discussion.
            </div>
           )}

            {/* Render comment list */}
                <CommentList articleId={article.id} currentUserId={currentUserId} />
        </div>
    </div>
  )
}
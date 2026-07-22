import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardActions from '@/components/DashboardActions'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user }} = await supabase.auth.getUser()
    if(!user) redirect('/login')

    const customUser = await prisma.user.findUnique({
        where: { email: user.email!},
        select: { id: true, badge: true, username: true},
    })

    if(!customUser || customUser.badge !== 'Creator') {
        redirect('/access-denied')
    }

    const articles = await prisma.article.findMany({
        where: { author_id: customUser.id},
        orderBy: { created_at: 'desc'},
        select: {
            id: true,
            slug: true,
            title: true,
            type: true,
            is_published: true,
            published_at: true,
            created_at: true,
        },
    })

    return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold">Dashboard</h1>
          <Link
            href="/write"
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full font-semibold transition"
          >
            + New Article
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">You haven’t written any articles yet.</p>
            <Link href="/write" className="text-purple-400 hover:underline mt-2 inline-block">
              Create your first one
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 text-sm uppercase">
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Published</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="bg-[#131a2c] rounded-lg">
                    <td className="px-4 py-3 font-medium">
                      {article.title}
                      <div className="text-xs text-gray-500 mt-1">
                        /{article.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
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

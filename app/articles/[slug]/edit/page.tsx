import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import WrtieForm from '@/components/WriteForm'
import WriteForm from '@/components/WriteForm'

export default async function EditArticlePage({
    params,
}: {
    params: Promise<{slug: string}>
}) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user }} = await supabase.auth.getUser()
    if(!user) redirect('/login')
    
    const customUser = await prisma.user.findUnique({
        where: { email: user.email!},
        select: { id: true, badge: true},
    })
    if (!customUser || customUser.badge !== 'Creator') redirect('/access-denied')

    const article = await prisma.article.findUnique({
        where: { slug },
        include: {
            ArticleTag: { include: { Tag: true }},
            ArticleGameLink: { include: { GamePage: true}},
        },
    })

    if (!article) notFound()
    if (article.author_id !== customUser.id) redirect('/access-denied')

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold mb-8">Edit Article</h1>
                <WriteForm article={article} />
            </div>
        </div>
    )

}
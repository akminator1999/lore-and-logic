'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function togglePublish( articleId: string) {
    const supabase = await createClient()
    const { data: { user }} = await supabase.auth.getUser()
    if(!user) throw new Error('Not authenticated')

    const customUser = await prisma.user.findUnique({
        where: {email: user.email!},
        select: { id: true, badge: true},
    })
    if (!customUser || customUser.badge !== 'Creator') throw new Error('Only creators can modify articles')

    const article = await prisma.article.findUnique({
        where: { id: articleId},
        select: { author_id: true, is_published: true},
    })

    if (!article || article.author_id !== customUser.id) {
        throw new Error('Not authorised')
    }

    await prisma.article.update({
        where: { id: articleId},
        data: { is_published: !article.is_published},
    })

    revalidatePath('/dashboard')
}
    export async function deleteArticle(articleId: string) {
        const supabase = await createClient()
        const { data: { user }} = await supabase.auth.getUser()
        if(!user) throw new Error('Not authenticated')

        const customUser = await prisma.user.findUnique({
            where: { email: user.email!},
            select: { id: true, badge: true},
        })
        if(!customUser || customUser.badge !== 'Creator') throw new Error('Only creators can delete articles')

        const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { author_id: true},
        })

        if (!article || article.author_id !== customUser.id) {
            throw new Error('Not authorized')
        }

        //Delete article and related records (prisma cascade)
        await prisma.article.delete({ where: { id: articleId }})

        revalidatePath('/dashboard')
    }


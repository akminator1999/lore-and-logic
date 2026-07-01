'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addComment(
    articleId: string,
    body: string,
    parentId?: string
) {
    if(!body || body.trim().length === 0) throw new Error('Comment cannot be empty')

    const supabase = await createClient()
    const { data: { user }} = await supabase.auth.getUser()
    if(!user) throw new Error('Not Authenticated')

    const customUser = await prisma.user.findUnique({
        where: {email: user.email! },
        select: {id: true},
    })

    if(!customUser) throw new Error('Profile not found')

    await prisma.comment.create({
        data: {
            body: body.trim(),
            author_id: customUser.id,
            article_id: articleId,
            parent_id: parentId || null,
        },
    })

    //Revalidate the article page to new comments appear

    revalidatePath(`/articles/[slug]`, 'page')

}
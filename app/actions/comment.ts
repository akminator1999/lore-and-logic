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

export async function editComment(commentId: string, newBody: string) {
    if(!newBody || newBody.trim().length === 0) throw new Error('Comment cannot be empty')
        
    const supabase = await createClient()
    const { data: { user }} = await supabase.auth.getUser()
        if(!user) throw new Error('Not Authenticated')

    const customUser = await prisma.user.findUnique({
            where: {email: user.email! },
            select: {id: true},

    })

        if(!customUser) throw new Error('Profile not Found')

    //Ensure the comment belongs to the Current User
    const comment = await prisma.comment.findUnique({
        where: {id: commentId},
        select: {author_id: true, deleted: true},   //fetch deleted flag
    })
        if(!comment || comment.author_id !== customUser.id) throw new Error('Not Authorised to edit this comment')

        if(comment.deleted) throw new Error('Cannot edit a deleted comment')

    await prisma.comment.update({
        where: {id: commentId},
        data: {body: newBody.trim(), updated_at: new Date()
        },
    })

    revalidatePath(`/articles/[slug]`, 'page')
}
//New version of deleteComment - soft delete, sets deleted flag to true, and revalidates the article page
export async function deleteComment(commentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

    const customUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { id: true },
    })
        if (!customUser) throw new Error('Profile not found')

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { author_id: true },
    })

        if (!comment || comment.author_id !== customUser.id) throw new Error('Not authorized')
    
    // Instead of deleting the comment, we set the deleted flag to true
    // Soft delete – just set the flag
    await prisma.comment.update({
        where: { id: commentId },
        data: { deleted: true },
    })

  revalidatePath(`/articles/[slug]`, 'page')
}
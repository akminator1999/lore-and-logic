'use server'

import {prisma} from '@/lib/prisma'

export async function recordView(articleId: string) {
    // Increment the view count for the article
    await prisma.article.update({
        where: { id: articleId},
        data: { view_count: { increment: 1}},
    })

    //Insert a detailed page view record for analytics
    await prisma.pageView.create({
        data: {
            article_id: articleId,
            //user_id could be set if i have session, but i can omit for now
        },
    })
}
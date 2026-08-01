'use client'

import { useEffect } from 'react'
import { recordView } from '@/app/actions/analytics'

export default function ViewTracker({ articleId }: { articleId: string }) {
    useEffect(() => {
        recordView(articleId)
    })

    return null
}
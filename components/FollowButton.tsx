'use client'

import { useState, useTransition} from 'react'
import { toggleFollow} from '@/app/actions/follow'
import { useRouter} from 'next/navigation'

export default function FollowButton({
    followingId,
    initialIsFollowing,
}: {
    followingId: string
    initialIsFollowing: boolean
}) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleClick = () => {
        startTransition(async () => {
            try {
                const result = await toggleFollow(followingId)
                setIsFollowing(result.isFollowing)
                router.refresh()
            } catch (error) {
                console.error(error)
            }
        })
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${isFollowing ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </button>
    )
}
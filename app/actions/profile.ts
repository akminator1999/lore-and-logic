'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }} = await supabase.auth.getUser()
    if(!user) throw new Error('Not authenticated')

    //Get the custom user record
    const customUser = await prisma.user.findUnique({
        where: { email: user.email!},
        select: { id: true, role: true},
    })
    if (!customUser) throw new Error('Profile not found')
    
    const username = formData.get('username') as string
    const bio = formData.get('bio') as string | null
    const avatarUrl = formData.get('avatar_url') as string | null
    const favoriteGenresStr = (formData.get('favortie_genres') as string) || ''
    const gamesWorkedOnStr = (formData.get('games_worked_on') as string) || ''
    const devRole = formData.get('dev_role') as string | null

    //Basic validation
    if (!username || username.trim().length === 0) {
        return { error: 'Username is required'}
    }

    //Check if username is already taken by another user
    const existing = await prisma.user.findUnique({
        where: { username}
    })
    if (existing && existing.id !== customUser.id) {
        return { error: 'Username already taken'}
    }

    //Convert comma-separated stirngs to arrays
    const favoriteGenres = favoriteGenresStr.split(',').map(g => g.trim()).filter(Boolean)
    const gamesWorkedOn = gamesWorkedOnStr.split(',').map(g => g.trim()).filter(Boolean)

    // Update the profile
    await prisma.user.update({
        where: {id: customUser.id},
        data: {
            username: username.trim(),
            bio: bio || null,
            avatar_url: avatarUrl || null,
            favorite_genres: favoriteGenres,
            dev_role: customUser.role === 'developer' ? devRole : null,
            games_worked_on: customUser.role === 'developer' ? gamesWorkedOn : [],
            // Portfolio_links is omitted for now
        },
    })

    revalidatePath(`/profile/${username}`)
    redirect(`/profile/${username}`)
} 
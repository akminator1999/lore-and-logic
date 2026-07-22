import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import EditProfileForm from '@/components/EditProfileForm'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!customUser) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-8">Edit Profile</h1>
        <EditProfileForm profile={customUser} />
      </div>
    </div>
  )
}
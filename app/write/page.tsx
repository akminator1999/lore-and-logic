import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WriteForm from '@/components/WriteForm'
import { prisma } from '@/lib/prisma'

export default async function WritePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  //Runtime Error will have to check render method of 'WrtiePage'
    //Error says element type is invalid: expected a string or class/fucntion
    //but got : object 

    console.log('WriteForm is:', WriteForm)
  
  //Fetch the custom user profile to check badge
  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { badge: true },
  })

  //if user does not have Creator badge, redirect them
  if (!customUser || customUser.badge !== 'Creator') {
    redirect('/access-denied') //or a dedicated "access denied" page
  }
  
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-8">Write an Article</h1>
        <WriteForm/> 
      </div>
    </div>
  )
}
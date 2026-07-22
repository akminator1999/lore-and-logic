import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user }} = await supabase.auth.getUser()

  //If already logged in, redirect to home
  if (user) redirect('/')

  async function signup(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    const supabase = await createClient()
    const { error, data } = await supabase.auth.signUp({ email, password })

    if (error) {
      return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          username: email.split('@')[0],
          role,
          badge: role === 'developer' ? 'Creator' : 'Player',
          favorite_genres: [],
          games_worked_on: [],
        },
      })
    }

    redirect('/login?message=Check your email to confirm your account')
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <div className="bg-[#131a2c] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Join <span className="text-purple-400">Lore &amp; Logic</span>
        </h1>

        <form action={signup} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm">I am a...</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="gamer"
                  defaultChecked
                  className="accent-purple-500"
                />
                🎮 Gamer
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="developer"
                  className="accent-purple-500"
                />
                🔧 Developer
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-lg transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
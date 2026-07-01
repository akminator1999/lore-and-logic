import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  async function login(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <div className="bg-[#131a2c] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Log in to <span className="text-purple-400">Lore &amp; Logic</span>
        </h1>

        <form action={login} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-lg transition"
          >
            Log In
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
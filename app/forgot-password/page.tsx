import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  async function requestReset(formData: FormData) {
  'use server'
  const email = formData.get('email') as string

  // Use the production URL if set, otherwise localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }
  return redirect('/forgot-password?sent=true')
}
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <div className="bg-[#131a2c] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Forgot <span className="text-purple-400">Password</span>
        </h1>

        <form action={requestReset} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-lg transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Remember your password?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}